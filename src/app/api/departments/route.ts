import { db } from "@/db";
import { departments } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";

export async function GET() {
  const data = await db.select().from(departments);
  return Response.json(data);
}

export async function POST(request: NextRequest) {
  try {
    const { name, parentId } = await request.json();
    const [inserted] = await db.insert(departments).values({ name, parentId }).returning();
    return Response.json(inserted);
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    await db.delete(departments).where(eq(departments.id, id));
    return Response.json({ success: true });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
