// ============================================================
// KiCob — History API Route Handler
// ============================================================

import { NextRequest } from "next/server";
import { db } from "@/db";
import { recommendationHistory, projects, user, teamCandidates } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const allRecs = await db.select().from(recommendationHistory);
  const allProjects = await db.select().from(projects);
  const allUsers = await db.select().from(user);

  const result = allRecs.map((rec) => ({
    ...rec,
    project: allProjects.find((p) => p.id === rec.projectId) ?? null,
    approver: allUsers.find((u) => u.id === rec.approvedBy) ?? null,
  }));

  return Response.json(result);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { projectId, decisionNote, status, approvedBy } = body;

  if (!projectId || !status) {
    return Response.json({ error: "Missing projectId or status" }, { status: 400 });
  }

  const projId = Number(projectId);

  // 1. Clear existing candidates for this project (they are now in history/decided)
  await db.delete(teamCandidates).where(eq(teamCandidates.projectId, projId));

  // 2. Log the decision in history
  const [newRec] = await db
    .insert(recommendationHistory)
    .values({
      projectId: projId,
      decisionNote: decisionNote || "",
      status,
      approvedBy,
    })
    .returning();

  // 3. If approved, set project status to 'active'
  if (status === "approved") {
    await db
      .update(projects)
      .set({ status: "active" })
      .where(eq(projects.id, projId));
  }

  return Response.json(newRec, { status: 201 });
}
