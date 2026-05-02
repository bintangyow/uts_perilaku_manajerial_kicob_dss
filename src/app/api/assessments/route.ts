// ============================================================
// KiCob — Assessments API Route Handler
// ============================================================

import { NextRequest } from "next/server";
import { db } from "@/db";
import { assessments, behavioralScores, employees } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const employeeId = searchParams.get("employeeId");

  if (employeeId) {
    const result = await db
      .select()
      .from(assessments)
      .where(eq(assessments.employeeId, Number(employeeId)));
    return Response.json(result);
  }

  // Return assessments grouped by employee
  const allEmployees = await db.select().from(employees);
  const allAssessments = await db.select().from(assessments);

  const grouped = allEmployees.map((emp) => {
    const empAssessments = allAssessments.filter((a) => a.employeeId === emp.id);
    return {
      ...emp,
      totalAssessments: empAssessments.length,
      assessments: empAssessments,
    };
  });

  return Response.json(grouped);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const {
    assessorName,
    employeeId,
    assessmentType,
    emotionalStability,
    communication,
    teamwork,
    adaptability,
    period,
    notes,
  } = body;

  if (!assessorName || !employeeId || !assessmentType) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Calculate consistency score (simple avg similarity)
  const avg = (emotionalStability + communication + teamwork + adaptability) / 4;
  const diffs = [emotionalStability, communication, teamwork, adaptability].map(
    (v) => Math.abs(v - avg)
  );
  const consistencyScore = Math.max(0, 1 - diffs.reduce((a, b) => a + b, 0) / 4);

  const [newAssessment] = await db
    .insert(assessments)
    .values({
      assessorName,
      employeeId: Number(employeeId),
      assessmentType,
      emotionalStability,
      communication,
      teamwork,
      adaptability,
      consistencyScore: Math.round(consistencyScore * 100) / 100,
      period: period || "Mei 2024",
      notes: notes || null,
    })
    .returning();

  // Recalculate behavioral score for employee
  const empAssessments = await db
    .select()
    .from(assessments)
    .where(eq(assessments.employeeId, Number(employeeId)));

  const count = empAssessments.length;
  const avgES = empAssessments.reduce((s, a) => s + a.emotionalStability, 0) / count;
  const avgCM = empAssessments.reduce((s, a) => s + a.communication, 0) / count;
  const avgTW = empAssessments.reduce((s, a) => s + a.teamwork, 0) / count;
  const avgAD = empAssessments.reduce((s, a) => s + a.adaptability, 0) / count;
  const finalScore = (avgES + avgCM + avgTW + avgAD) / 4;

  // Upsert behavioral score
  const existing = await db
    .select()
    .from(behavioralScores)
    .where(eq(behavioralScores.employeeId, Number(employeeId)));

  if (existing.length > 0) {
    await db
      .update(behavioralScores)
      .set({
        avgEmotionalStability: Math.round(avgES * 100) / 100,
        avgCommunication: Math.round(avgCM * 100) / 100,
        avgTeamwork: Math.round(avgTW * 100) / 100,
        avgAdaptability: Math.round(avgAD * 100) / 100,
        finalBehaviorScore: Math.round(finalScore * 100) / 100,
        updatedAt: new Date(),
      })
      .where(eq(behavioralScores.employeeId, Number(employeeId)));
  } else {
    await db.insert(behavioralScores).values({
      employeeId: Number(employeeId),
      avgEmotionalStability: Math.round(avgES * 100) / 100,
      avgCommunication: Math.round(avgCM * 100) / 100,
      avgTeamwork: Math.round(avgTW * 100) / 100,
      avgAdaptability: Math.round(avgAD * 100) / 100,
      finalBehaviorScore: Math.round(finalScore * 100) / 100,
    });
  }

  return Response.json(newAssessment, { status: 201 });
}
