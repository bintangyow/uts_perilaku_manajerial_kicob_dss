// ============================================================
// KiCob — Projects API Route Handler
// ============================================================

import { NextRequest } from "next/server";
import { db } from "@/db";
import { projects, projectRequirements, skills } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const allProjects = await db.select().from(projects);

  const result = await Promise.all(
    allProjects.map(async (project) => {
      const reqs = await db
        .select({
          id: projectRequirements.id,
          projectId: projectRequirements.projectId,
          skillId: projectRequirements.skillId,
          requiredLevel: projectRequirements.requiredLevel,
          isMandatory: projectRequirements.isMandatory,
          skillName: skills.skillName,
          category: skills.category,
        })
        .from(projectRequirements)
        .innerJoin(skills, eq(projectRequirements.skillId, skills.id))
        .where(eq(projectRequirements.projectId, project.id));

      return { ...project, requirements: reqs };
    })
  );

  return Response.json(result);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const {
    projectName,
    description,
    teamSize,
    hardSkillWeight,
    softFactorWeight,
    requirements,
  } = body;

  if (!projectName) {
    return Response.json({ error: "Missing projectName" }, { status: 400 });
  }

  const [newProject] = await db
    .insert(projects)
    .values({
      projectName,
      description: description || "",
      teamSize: teamSize || 3,
      hardSkillWeight: hardSkillWeight || 0.6,
      softFactorWeight: softFactorWeight || 0.4,
      status: "draft",
    })
    .returning();

  // Insert requirements if provided
  if (requirements && Array.isArray(requirements)) {
    for (const req of requirements) {
      await db.insert(projectRequirements).values({
        projectId: newProject.id,
        skillId: req.skillId,
        requiredLevel: req.requiredLevel || 3,
        isMandatory: req.isMandatory || false,
      });
    }
  }

  return Response.json(newProject, { status: 201 });
}
