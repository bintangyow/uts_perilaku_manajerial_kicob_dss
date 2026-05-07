// ============================================================
// KiCob — Team Candidates API Route Handler
// ============================================================

import { NextRequest } from "next/server";
import { db } from "@/db";
import {
  teamCandidates,
  teamMembers,
  employees,
  projects,
  projectRequirements,
  employeeSkills,
  behavioralScores,
  user,
} from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const allCandidates = await db.select().from(teamCandidates);
  const allMembers = await db.select().from(teamMembers);
  const allEmployees = await db
    .select({
      id: employees.id,
      name: user.name,
      position: employees.position,
    })
    .from(employees)
    .leftJoin(user, eq(employees.userId, user.id));

  const result = allCandidates.map((candidate) => {
    const candidateMembers = allMembers
      .filter((m) => m.teamCandidateId === candidate.id)
      .map((m) => {
        const emp = allEmployees.find((e) => e.id === m.employeeId);
        return {
          ...m,
          employeeName: emp?.name || "Unknown",
          employeePosition: emp?.position || "Unknown",
        };
      });

    return { ...candidate, members: candidateMembers };
  });

  return Response.json(result);
}

// PATCH: Swap a member in a team candidate
export async function PATCH(request: NextRequest) {
  try {
    const { teamMemberId, newEmployeeId } = await request.json();

    if (!teamMemberId || !newEmployeeId) {
      return Response.json({ error: "Missing teamMemberId or newEmployeeId" }, { status: 400 });
    }

    const [updated] = await db
      .update(teamMembers)
      .set({ employeeId: Number(newEmployeeId) })
      .where(eq(teamMembers.id, Number(teamMemberId)))
      .returning();

    if (!updated) {
      return Response.json({ error: "Team member not found" }, { status: 404 });
    }

    return Response.json(updated);
  } catch (error: any) {
    console.error("Error swapping member:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { projectId, excludeEmployeeIds = [] } = await request.json();

    if (!projectId) {
      return Response.json({ error: "Missing projectId" }, { status: 400 });
    }

    const projId = Number(projectId);

    const [project] = await db.select().from(projects).where(eq(projects.id, projId));
    if (!project) {
      return Response.json({ error: "Project not found" }, { status: 404 });
    }

    const reqs = await db
      .select()
      .from(projectRequirements)
      .where(eq(projectRequirements.projectId, projId));

    const allEmployees = await db.select().from(employees);

    // Filter out excluded employees (for alternative team generation)
    const availableEmployees = excludeEmployeeIds.length > 0
      ? allEmployees.filter((e) => !excludeEmployeeIds.includes(e.id))
      : allEmployees;

    if (availableEmployees.length === 0) {
      return Response.json({ error: "No available employees after exclusion" }, { status: 400 });
    }

    // Scoring Algorithm (SAW)
    const scored = await Promise.all(
      availableEmployees.map(async (emp) => {
        const empSkills = await db
          .select()
          .from(employeeSkills)
          .where(eq(employeeSkills.employeeId, emp.id));

        let hardSkillSum = 0;
        if (reqs.length > 0) {
          reqs.forEach((req) => {
            const match = empSkills.find((es) => es.skillId === req.skillId);
            const level = match?.level || 0;
            hardSkillSum += Math.min(level / req.requiredLevel, 1);
          });
          hardSkillSum = (hardSkillSum / reqs.length) * 100;
        } else {
          hardSkillSum = 50;
        }

        const scores = await db
          .select()
          .from(behavioralScores)
          .where(eq(behavioralScores.employeeId, emp.id));

        let softFactorSum = 60;
        if (scores.length > 0) {
          const total = scores.reduce((sum, s) => sum + (Number(s.finalBehaviorScore) || 0), 0);
          softFactorSum = (total / (scores.length * 5)) * 100;
        }

        const hWeight = Number(project.hardSkillWeight) || 0.6;
        const sWeight = Number(project.softFactorWeight) || 0.4;

        return {
          id: emp.id,
          hardSkillScore: hardSkillSum,
          softFactorScore: softFactorSum,
          totalScore: hardSkillSum * hWeight + softFactorSum * sWeight,
        };
      })
    );

    const sorted = scored.sort((a, b) => b.totalScore - a.totalScore);
    const selectedTeam = sorted.slice(0, project.teamSize || 3);

    // Determine ranking (next rank after existing candidates)
    const existingCandidates = await db
      .select()
      .from(teamCandidates)
      .where(eq(teamCandidates.projectId, projId));
    const nextRanking = existingCandidates.length + 1;

    const [newCandidate] = await db
      .insert(teamCandidates)
      .values({
        projectId: project.id,
        ranking: nextRanking,
        totalScore: (
          selectedTeam.reduce((s, m) => s + m.totalScore, 0) / (selectedTeam.length || 1)
        ).toFixed(2),
      })
      .returning();

    for (const member of selectedTeam) {
      await db.insert(teamMembers).values({
        teamCandidateId: newCandidate.id,
        employeeId: member.id,
        contributionScore: member.totalScore.toFixed(2),
        hardSkillScore: member.hardSkillScore.toFixed(2),
        softFactorScore: member.softFactorScore.toFixed(2),
      });
    }

    return Response.json(newCandidate, { status: 201 });
  } catch (error: any) {
    console.error("Error in DSS generation:", error);
    return Response.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

