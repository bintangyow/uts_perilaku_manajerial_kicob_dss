import { db } from "@/db";
import { positions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";

export async function GET() {
  const data = await db.select().from(positions);
  return Response.json(data);
}

export async function POST(request: NextRequest) {
  try {
    const { name, jobLevel } = await request.json();
    const [inserted] = await db.insert(positions).values({ name, jobLevel }).returning();
    return Response.json(inserted);
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    await db.delete(positions).where(eq(positions.id, id));
    return Response.json({ success: true });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, name, jobLevel } = await request.json();
    const [updated] = await db.update(positions)
      .set({ name, jobLevel })
      .where(eq(positions.id, id))
      .returning();
    return Response.json(updated);
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
