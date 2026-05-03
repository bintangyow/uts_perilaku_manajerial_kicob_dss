// ============================================================
// KiCob — History API Route Handler
// ============================================================

import { NextRequest } from "next/server";
import { db } from "@/db";
import { recommendationHistory, projects, user, teamCandidates } from "@/db/schema";
import { eq, and, ne } from "drizzle-orm";

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
  const { projectId, candidateId, decisionNote, status, approvedBy } = body;

  if (!projectId || !status) {
    return Response.json({ error: "Missing projectId or status" }, { status: 400 });
  }

  const projId = Number(projectId);
  const candId = candidateId ? Number(candidateId) : null;

  // 1. Log the decision in history
  const [newRec] = await db
    .insert(recommendationHistory)
    .values({
      projectId: projId,
      decisionNote: decisionNote || "",
      status,
      approvedBy,
    })
    .returning();

  // 2. Handle Project Status and Candidates cleanup
  if (status === "approved") {
    // Set project status to 'active'
    await db
      .update(projects)
      .set({ status: "active" })
      .where(eq(projects.id, projId));

    if (candId) {
      // Clear ALL OTHER candidates for this project, KEEP the approved one
      await db
        .delete(teamCandidates)
        .where(and(eq(teamCandidates.projectId, projId), ne(teamCandidates.id, candId)));
    } else {
      // Fallback: if no candId, clear all (legacy behavior)
      await db.delete(teamCandidates).where(eq(teamCandidates.projectId, projId));
    }
  } else if (status === "rejected" && candId) {
    // If rejected, only clear this specific candidate
    await db.delete(teamCandidates).where(eq(teamCandidates.id, candId));
  } else if (status === "rejected" && !candId) {
    // Fallback: clear all if rejected and no ID
    await db.delete(teamCandidates).where(eq(teamCandidates.projectId, projId));
  }

  return Response.json(newRec, { status: 201 });
}
