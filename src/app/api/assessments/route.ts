import { NextRequest } from "next/server";
import { db } from "@/db";
import { assessments, behavioralScores, assessmentPeriods, employees, user, departments, positions } from "@/db/schema";
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

  const allEmployees = await db
    .select({
      id: employees.id,
      userId: employees.userId,
      employeeCode: employees.employeeCode,
      department: departments.name,
      position: positions.name,
      status: employees.status,
      name: user.name,
      image: user.image,
      email: user.email,
    })
    .from(employees)
    .leftJoin(user, eq(employees.userId, user.id))
    .leftJoin(departments, eq(employees.departmentId, departments.id))
    .leftJoin(positions, eq(employees.positionId, positions.id));

  const allAssessments = await db
    .select({
      id: assessments.id,
      assessorName: assessments.assessorName,
      employeeId: assessments.employeeId,
      assessmentType: assessments.assessmentType,
      periodName: assessmentPeriods.name,
    })
    .from(assessments)
    .leftJoin(assessmentPeriods, eq(assessments.periodId, assessmentPeriods.id));

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
  try {
    const body = await request.json();
    const { assessorName, employeeId, assessmentType, notes, ...rest } = body;

    const activePeriod = await db.query.assessmentPeriods.findFirst({
      where: eq(assessmentPeriods.isCurrent, true)
    });

    if (activePeriod && activePeriod.status !== "active") {
      return Response.json({ error: `Periode ${activePeriod.name} sedang ${activePeriod.status}.` }, { status: 403 });
    }

    const currentPeriodId = activePeriod?.id || null;
    const empId = Number(employeeId);

    // 1. Duplicate Check
    const existing = await db.select().from(assessments).where(and(
      eq(assessments.employeeId, empId),
      eq(assessments.assessorName, assessorName),
      currentPeriodId ? eq(assessments.periodId, currentPeriodId) : undefined
    ));
    if (existing.length > 0) return Response.json({ error: "Anda sudah memberikan penilaian." }, { status: 400 });

    // 2. Dynamic Calculation of Theme Averages
    const getThemeAvg = (prefix: string) => {
      // Find all keys in 'rest' that start with this prefix (e.g., 'es', 'comm')
      const keys = Object.keys(rest).filter(k => k.startsWith(prefix));
      if (keys.length === 0) return 0;
      const vals = keys.map(k => Number(rest[k] || 0));
      return vals.reduce((a, b) => a + b, 0) / vals.length;
    };

    const es = getThemeAvg('es');
    const cm = getThemeAvg('comm');
    const tw = getThemeAvg('tw');
    const ad = getThemeAvg('ad');

    // 3. Insert Assessment
    const [newAssessment] = await db.insert(assessments).values({
      assessorName,
      employeeId: empId,
      assessmentType,
      periodId: currentPeriodId,
      notes: notes || null,
      emotionalStability: es.toFixed(2),
      communication: cm.toFixed(2),
      teamwork: tw.toFixed(2),
      adaptability: ad.toFixed(2),
      scores: rest,
      consistencyScore: "0",
    }).returning();

    // 4. Update Behavioral Scores (Weighted 360)
    const allAss = await db.select().from(assessments).where(eq(assessments.employeeId, empId));
    const weightMap: Record<string, number> = { supervisor: 0.5, peer: 0.3, self: 0.2, upward: 0.1 };

    const aggregate = () => {
      const keys = Array.from(new Set(allAss.flatMap(a => Object.keys(a.scores || {}))));
      const avgs: Record<string, number> = {};
      
      keys.forEach(k => {
        let wSum = 0, wTotal = 0;
        allAss.forEach(a => {
          const w = weightMap[a.assessmentType] || 0.1;
          const v = Number(a.scores?.[k] || 0);
          if (v > 0) { wSum += v * w; wTotal += w; }
        });
        avgs[k] = wTotal > 0 ? Number((wSum / wTotal).toFixed(2)) : 0;
      });
      return avgs;
    };

    const finalDetails = aggregate();
    
    // Calculate theme averages from aggregated dynamic details
    const getFinalThemeAvg = (prefix: string) => {
      const keys = Object.keys(finalDetails).filter(k => k.startsWith(prefix));
      if (keys.length === 0) return 0;
      return keys.reduce((acc, k) => acc + finalDetails[k], 0) / keys.length;
    };

    const fES = getFinalThemeAvg('es');
    const fCM = getFinalThemeAvg('comm');
    const fTW = getFinalThemeAvg('tw');
    const fAD = getFinalThemeAvg('ad');
    const fTotal = (fES + fCM + fTW + fAD) / 4;

    await db.insert(behavioralScores).values({
      employeeId: empId,
      avgEmotionalStability: fES.toFixed(2),
      avgCommunication: fCM.toFixed(2),
      avgTeamwork: fTW.toFixed(2),
      avgAdaptability: fAD.toFixed(2),
      averages: finalDetails,
      finalBehaviorScore: fTotal.toFixed(2),
    }).onConflictDoUpdate({
      target: behavioralScores.employeeId,
      set: {
        avgEmotionalStability: fES.toFixed(2),
        avgCommunication: fCM.toFixed(2),
        avgTeamwork: fTW.toFixed(2),
        avgAdaptability: fAD.toFixed(2),
        averages: finalDetails,
        finalBehaviorScore: fTotal.toFixed(2),
        updatedAt: new Date(),
      }
    });

    return Response.json(newAssessment, { status: 201 });
  } catch (error: any) {
    console.error("POST Assessment Error:", error);
    return Response.json({ error: error.message || "Gagal menyimpan penilaian." }, { status: 500 });
  }
}
