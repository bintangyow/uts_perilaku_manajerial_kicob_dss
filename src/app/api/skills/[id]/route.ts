// ============================================================
// KiCob — Single Skill API Route Handler
// ============================================================

import { NextRequest } from "next/server";
import { db } from "@/db";
import { skills } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const [deleted] = await db
    .delete(skills)
    .where(eq(skills.id, Number(id)))
    .returning();

  if (!deleted) {
    return Response.json({ error: "Skill not found" }, { status: 404 });
  }

  return Response.json({ success: true });
}
