import { NextRequest } from "next/server";
import { db } from "@/db";
import { assessments, behavioralScores, employees, user } from "@/db/schema";
import { eq, and } from "drizzle-orm";

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

  // Return assessments grouped by employee, joined with user for names
  const allEmployees = await db
    .select({
      id: employees.id,
      userId: employees.userId,
      employeeCode: employees.employeeCode,
      department: employees.department,
      position: employees.position,
      status: employees.status,
      name: user.name,
      email: user.email,
    })
    .from(employees)
    .leftJoin(user, eq(employees.userId, user.id));

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

  const currentPeriod = period || new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(new Date());

  if (!assessorName || !employeeId || !assessmentType) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  const empId = Number(employeeId);

  // 1. Prevent Duplicate Assessment (Same assessor, same employee, same period)
  const existingAss = await db
    .select()
    .from(assessments)
    .where(
      and(
        eq(assessments.employeeId, empId),
        eq(assessments.assessorName, assessorName),
        eq(assessments.period, currentPeriod)
      )
    );
  
  if (existingAss.length > 0) {
    return Response.json({ error: "Anda sudah memberikan penilaian untuk karyawan ini di periode ini." }, { status: 400 });
  }

  // 2. Calculate consistency score
  const avg = (emotionalStability + communication + teamwork + adaptability) / 4;
  const diffs = [emotionalStability, communication, teamwork, adaptability].map((v) => Math.abs(v - avg));
  const consistencyScore = Math.max(0, 1 - diffs.reduce((a, b) => a + b, 0) / 4);

  const [newAssessment] = await db
    .insert(assessments)
    .values({
      assessorName,
      employeeId: empId,
      assessmentType,
      emotionalStability: emotionalStability.toString(),
      communication: communication.toString(),
      teamwork: teamwork.toString(),
      adaptability: adaptability.toString(),
      consistencyScore: (Math.round(consistencyScore * 100) / 100).toString(),
      period: currentPeriod,
      notes: notes || null,
    })
    .returning();

  // 3. Recalculate behavioral score using WEIGHTED AVERAGE
  const empAssessments = await db.select().from(assessments).where(eq(assessments.employeeId, empId));

  const weightedCalc = {
    supervisor: { es: 0, cm: 0, tw: 0, ad: 0, count: 0, weight: 0.5 },
    peer: { es: 0, cm: 0, tw: 0, ad: 0, count: 0, weight: 0.3 },
    self: { es: 0, cm: 0, tw: 0, ad: 0, count: 0, weight: 0.2 },
  };

  empAssessments.forEach((a) => {
    const type = a.assessmentType as keyof typeof weightedCalc;
    if (weightedCalc[type]) {
      weightedCalc[type].es += Number(a.emotionalStability);
      weightedCalc[type].cm += Number(a.communication);
      weightedCalc[type].tw += Number(a.teamwork);
      weightedCalc[type].ad += Number(a.adaptability);
      weightedCalc[type].count++;
    }
  });

  let totalWeight = 0;
  let finalES = 0, finalCM = 0, finalTW = 0, finalAD = 0;

  (Object.keys(weightedCalc) as Array<keyof typeof weightedCalc>).forEach((type) => {
    const data = weightedCalc[type];
    if (data.count > 0) {
      finalES += (data.es / data.count) * data.weight;
      finalCM += (data.cm / data.count) * data.weight;
      finalTW += (data.tw / data.count) * data.weight;
      finalAD += (data.ad / data.count) * data.weight;
      totalWeight += data.weight;
    }
  });

  // Normalize if not all types are present
  const multiplier = totalWeight > 0 ? 1 / totalWeight : 0;
  const avgES = finalES * multiplier;
  const avgCM = finalCM * multiplier;
  const avgTW = finalTW * multiplier;
  const avgAD = finalAD * multiplier;
  const finalScore = (avgES + avgCM + avgTW + avgAD) / 4;

  // 4. Upsert behavioral score
  const existingScore = await db.select().from(behavioralScores).where(eq(behavioralScores.employeeId, empId));

  const scoreData = {
    avgEmotionalStability: avgES.toFixed(2),
    avgCommunication: avgCM.toFixed(2),
    avgTeamwork: avgTW.toFixed(2),
    avgAdaptability: avgAD.toFixed(2),
    finalBehaviorScore: finalScore.toFixed(2),
    updatedAt: new Date(),
  };

  if (existingScore.length > 0) {
    await db.update(behavioralScores).set(scoreData).where(eq(behavioralScores.employeeId, empId));
  } else {
    await db.insert(behavioralScores).values({ employeeId: empId, ...scoreData });
  }

  return Response.json(newAssessment, { status: 201 });
}
