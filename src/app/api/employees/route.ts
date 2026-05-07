// ============================================================
// KiCob — Employees API Route Handler
// ============================================================

import { NextRequest } from "next/server";
import { db } from "@/db";
import { employees, employeeSkills, skills, behavioralScores, user } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  // Join with user table to get name and email
  const allEmployees = await db
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
    .leftJoin(user, eq(employees.userId, user.id));

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
  try {
    const body = await request.json();
    const { userId, employeeCode, department, position, jobLevel, status } = body;

    if (!userId || !employeeCode || !department || !position || !jobLevel) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const [newEmployee] = await db
      .insert(employees)
      .values({
        userId,
        employeeCode,
        department,
        position,
        jobLevel: Number(jobLevel),
        status: status || "active",
      })
      .returning();

    return Response.json(newEmployee, { status: 201 });
  } catch (error: any) {
    console.error("Error creating employee:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
