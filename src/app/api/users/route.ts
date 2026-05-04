import { db } from "@/db";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";

export async function GET() {
  const users = await db.select().from(user);
  return Response.json(users);
}

export async function PUT(request: NextRequest) {
  try {
    const { id, role } = await request.json();
    if (!id || !role) return Response.json({ error: "Missing id or role" }, { status: 400 });

    const [updated] = await db
      .update(user)
      .set({ role })
      .where(eq(user.id, id))
      .returning();

    if (!updated) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    return Response.json(updated);
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
