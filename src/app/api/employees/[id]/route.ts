// ============================================================
// KiCob — Single Employee API Route Handler
// ============================================================

import { NextRequest } from "next/server";
import { db } from "@/db";
import { employees, employeeSkills, skills, behavioralScores, assessments, teamMembers, teamCandidates, projects, user } from "@/db/schema";
import { eq, and, inArray } from "drizzle-orm";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const empId = Number(id);

  const [employee] = await db
    .select({
      id: employees.id,
      userId: employees.userId,
      employeeCode: employees.employeeCode,
      department: employees.department,
      position: employees.position,
      jobLevel: employees.jobLevel,
      status: employees.status,
      name: user.name,
      email: user.email,
    })
    .from(employees)
    .leftJoin(user, eq(employees.userId, user.id))
    .where(eq(employees.id, empId));

  if (!employee) {
    return Response.json({ error: "Employee not found" }, { status: 404 });
  }

  // Calculate Total Projects (Active/Completed)
  const empProjects = await db
    .select({ id: projects.id })
    .from(teamMembers)
    .innerJoin(teamCandidates, eq(teamMembers.teamCandidateId, teamCandidates.id))
    .innerJoin(projects, eq(teamCandidates.projectId, projects.id))
    .where(
      and(
        eq(teamMembers.employeeId, empId),
        inArray(projects.status, ["active", "completed"])
      )
    );

  const empSkills = await db
    .select({
      id: employeeSkills.id,
      employeeId: employeeSkills.employeeId,
      skillId: employeeSkills.skillId,
      level: employeeSkills.level,
      skillName: skills.skillName,
      category: skills.category,
    })
    .from(employeeSkills)
    .innerJoin(skills, eq(employeeSkills.skillId, skills.id))
    .where(eq(employeeSkills.employeeId, empId));

  const scores = await db
    .select()
    .from(behavioralScores)
    .where(eq(behavioralScores.employeeId, empId));

  const empAssessments = await db
    .select()
    .from(assessments)
    .where(eq(assessments.employeeId, empId));

  return Response.json({
    ...employee,
    skills: empSkills,
    behavioralScore: scores[0] ?? null,
    assessments: empAssessments,
    totalProjects: empProjects.length,
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const [updated] = await db
    .update(employees)
    .set(body)
    .where(eq(employees.id, Number(id)))
    .returning();

  if (!updated) {
    return Response.json({ error: "Employee not found" }, { status: 404 });
  }

  return Response.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const [deleted] = await db
    .delete(employees)
    .where(eq(employees.id, Number(id)))
    .returning();

  if (!deleted) {
    return Response.json({ error: "Employee not found" }, { status: 404 });
  }

  return Response.json({ success: true });
}
