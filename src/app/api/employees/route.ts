// ============================================================
// KiCob — Employees API Route Handler
// ============================================================

import { NextRequest } from "next/server";
import { db } from "@/db";
import { employees, employeeSkills, skills, behavioralScores } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const allEmployees = await db.select().from(employees);

  // Fetch skills and scores for each employee
  const result = await Promise.all(
    allEmployees.map(async (emp) => {
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
        .where(eq(employeeSkills.employeeId, emp.id));

      const scores = await db
        .select()
        .from(behavioralScores)
        .where(eq(behavioralScores.employeeId, emp.id));

      return {
        ...emp,
        skills: empSkills,
        behavioralScore: scores[0] ?? null,
      };
    })
  );

  return Response.json(result);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, email, employeeCode, department, position, status } = body;

  if (!name || !email || !employeeCode || !department || !position) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  const [newEmployee] = await db
    .insert(employees)
    .values({
      name,
      email,
      employeeCode,
      department,
      position,
      status: status || "active",
    })
    .returning();

  return Response.json(newEmployee, { status: 201 });
}
