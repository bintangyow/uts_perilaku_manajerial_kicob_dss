import { db } from "@/db";
import { assessmentPeriods } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";

export async function GET() {
  const data = await db.select().from(assessmentPeriods).orderBy(assessmentPeriods.startDate);
  return Response.json(data);
}

export async function POST(request: NextRequest) {
  try {
    const { name, startDate, endDate, isCurrent } = await request.json();
    
    // If setting as current, unset others
    if (isCurrent) {
      await db.update(assessmentPeriods).set({ isCurrent: false });
    }

    const [inserted] = await db.insert(assessmentPeriods).values({ 
      name, 
      startDate: new Date(startDate), 
      endDate: new Date(endDate),
      isCurrent: isCurrent || false
    }).returning();
    return Response.json(inserted);
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, status, isCurrent } = await request.json();
    const updates: any = {};
    if (status) updates.status = status;
    if (isCurrent !== undefined) {
      if (isCurrent) {
        await db.update(assessmentPeriods).set({ isCurrent: false });
      }
      updates.isCurrent = isCurrent;
    }

    const [updated] = await db.update(assessmentPeriods).set(updates).where(eq(assessmentPeriods.id, id)).returning();
    return Response.json(updated);
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    await db.delete(assessmentPeriods).where(eq(assessmentPeriods.id, id));
    return Response.json({ success: true });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
