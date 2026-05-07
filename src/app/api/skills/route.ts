// ============================================================
// KiCob — Skills API Route Handler
// ============================================================

import { NextRequest } from "next/server";
import { db } from "@/db";
import { skills } from "@/db/schema";
import { sql } from "drizzle-orm";

export async function GET() {
  const allSkills = await db.select().from(skills);
  return Response.json(allSkills);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { skillName, category } = body;

    if (!skillName || !category) {
      return Response.json({ error: "Missing skillName or category" }, { status: 400 });
    }

    // Check for duplicate name (case-insensitive)
    const existing = await db
      .select()
      .from(skills)
      .where(sql`lower(${skills.skillName}) = lower(${skillName})`);

    if (existing.length > 0) {
      return Response.json(
        { error: `Skill "${skillName}" sudah ada dalam database.` },
        { status: 400 }
      );
    }

    const [newSkill] = await db
      .insert(skills)
      .values({ skillName, category })
      .returning();

    return Response.json(newSkill, { status: 201 });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
