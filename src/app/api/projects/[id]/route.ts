// ============================================================
// KiCob — Single Project API Route Handler
// ============================================================

import { NextRequest } from "next/server";
import { db } from "@/db";
import {
  projects,
  projectRequirements,
  skills,
  teamCandidates,
  teamMembers,
  employees,
  user,
  positions,
  departments,
} from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const projId = Number(id);

  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.id, projId));

  if (!project) {
    return Response.json({ error: "Project not found" }, { status: 404 });
  }

  const reqs = await db
    .select({
      id: projectRequirements.id,
      projectId: projectRequirements.projectId,
      skillId: projectRequirements.skillId,
      requiredLevel: projectRequirements.requiredLevel,
      isMandatory: projectRequirements.isMandatory,
      skillName: skills.skillName,
      category: skills.category,
    })
    .from(projectRequirements)
    .innerJoin(skills, eq(projectRequirements.skillId, skills.id))
    .where(eq(projectRequirements.projectId, projId));

  const candidates = await db
    .select()
    .from(teamCandidates)
    .where(eq(teamCandidates.projectId, projId));

  const candidatesWithMembers = await Promise.all(
    candidates.map(async (tc) => {
      const members = await db
        .select({
          id: teamMembers.id,
          teamCandidateId: teamMembers.teamCandidateId,
          employeeId: teamMembers.employeeId,
          contributionScore: teamMembers.contributionScore,
          hardSkillScore: teamMembers.hardSkillScore,
          softFactorScore: teamMembers.softFactorScore,
          employeeName: user.name,
          employeePosition: positions.name,
          employeeDepartment: departments.name,
        })
        .from(teamMembers)
        .innerJoin(employees, eq(teamMembers.employeeId, employees.id))
        .leftJoin(user, eq(employees.userId, user.id))
        .leftJoin(positions, eq(employees.positionId, positions.id))
        .leftJoin(departments, eq(employees.departmentId, departments.id))
        .where(eq(teamMembers.teamCandidateId, tc.id));

      return { ...tc, members };
    })
  );

  // Extract official members if any (take from the first candidate for active projects)
  const teamMembersList = candidatesWithMembers.length > 0 
    ? candidatesWithMembers[0].members 
    : [];

  return Response.json({
    ...project,
    requirements: reqs,
    teamCandidates: candidatesWithMembers,
    teamMembers: teamMembersList
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const [updated] = await db
    .update(projects)
    .set(body)
    .where(eq(projects.id, Number(id)))
    .returning();

  if (!updated) {
    return Response.json({ error: "Project not found" }, { status: 404 });
  }

  return Response.json(updated);
}
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const projId = Number(id);

  // Note: Database schema should handle cascades, but we can be explicit
  // In our schema, we have references.
  
  const deleted = await db
    .delete(projects)
    .where(eq(projects.id, projId))
    .returning();

  if (deleted.length === 0) {
    return Response.json({ error: "Project not found" }, { status: 404 });
  }

  return Response.json({ message: "Project deleted successfully" });
}
