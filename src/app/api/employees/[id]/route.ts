// ============================================================
// KiCob — Single Employee API Route Handler
// ============================================================

import { NextRequest } from "next/server";
import { db } from "@/db";
import { employees, employeeSkills, skills, behavioralScores, assessments } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const empId = Number(id);

  const [employee] = await db
    .select()
    .from(employees)
    .where(eq(employees.id, empId));

  if (!employee) {
    return Response.json({ error: "Employee not found" }, { status: 404 });
  }

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
