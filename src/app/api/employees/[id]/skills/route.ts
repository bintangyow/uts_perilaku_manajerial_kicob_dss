// ============================================================
// KiCob — Employee Skills API Route Handler
// ============================================================

import { NextRequest } from "next/server";
import { db } from "@/db";
import { employeeSkills } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { skillId, level } = body;

  if (!skillId || !level) {
    return Response.json({ error: "Missing skillId or level" }, { status: 400 });
  }

  const [newSkill] = await db
    .insert(employeeSkills)
    .values({
      employeeId: Number(id),
      skillId: Number(skillId),
      level: Number(level),
    })
    .returning();

  return Response.json(newSkill, { status: 201 });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const skillId = searchParams.get("skillId");

  if (!skillId) {
    return Response.json({ error: "Missing skillId query param" }, { status: 400 });
  }

  await db
    .delete(employeeSkills)
    .where(
      and(
        eq(employeeSkills.employeeId, Number(id)),
        eq(employeeSkills.skillId, Number(skillId))
      )
    );

  return Response.json({ success: true });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { skillId, level } = body;

  if (!skillId || !level) {
    return Response.json({ error: "Missing skillId or level" }, { status: 400 });
  }

  const [updated] = await db
    .update(employeeSkills)
    .set({ level: Number(level) })
    .where(
      and(
        eq(employeeSkills.employeeId, Number(id)),
        eq(employeeSkills.skillId, Number(skillId))
      )
    )
    .returning();

  if (!updated) {
    return Response.json({ error: "Skill not found for this employee" }, { status: 404 });
  }

  return Response.json(updated);
}
