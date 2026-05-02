// ============================================================
// KiCob — History ID Route Handler
// ============================================================

import { NextRequest } from "next/server";
import { db } from "@/db";
import { recommendationHistory } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = Number(idParam);

    if (isNaN(id)) {
      return Response.json({ error: "Invalid ID" }, { status: 400 });
    }

    const [deleted] = await db
      .delete(recommendationHistory)
      .where(eq(recommendationHistory.id, id))
      .returning();

    if (!deleted) {
      return Response.json({ error: "History not found" }, { status: 404 });
    }

    return Response.json({ message: "History deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting history:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
