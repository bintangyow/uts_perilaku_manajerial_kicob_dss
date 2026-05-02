// ============================================================
// KiCob — Skills API Route Handler
// ============================================================

import { NextRequest } from "next/server";
import { db } from "@/db";
import { skills } from "@/db/schema";

export async function GET() {
  const allSkills = await db.select().from(skills);
  return Response.json(allSkills);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { skillName, category } = body;

  if (!skillName || !category) {
    return Response.json({ error: "Missing skillName or category" }, { status: 400 });
  }

  const [newSkill] = await db
    .insert(skills)
    .values({ skillName, category })
    .returning();

  return Response.json(newSkill, { status: 201 });
}
