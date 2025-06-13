import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { squads, users } from "@/db/schema";
import { requireAuthWithRole } from "@/utils/auth";
import { eq } from "drizzle-orm";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAuthWithRole(["admin"]);
    const body = (await req.json()) as { name?: string; leaderId?: string };
    const { name, leaderId } = body;
    const { id: squadId } = await params;

    // Check if squad exists
    const existingSquad = await db
      .select()
      .from(squads)
      .where(eq(squads.id, squadId))
      .limit(1);

    if (existingSquad.length === 0) {
      return NextResponse.json({ error: "Squad not found" }, { status: 404 });
    }

    // Validate leader if provided
    if (leaderId) {
      const leader = await db
        .select()
        .from(users)
        .where(eq(users.id, leaderId))
        .limit(1);

      if (leader.length === 0 || leader[0]?.role !== "leader") {
        return NextResponse.json(
          { error: "Invalid leader. User must have leader role" },
          { status: 400 },
        );
      }
    }
    const [updatedSquad] = await db
      .update(squads)
      .set({
        name: name ?? existingSquad[0]!.name,
        leaderId: leaderId ?? existingSquad[0]!.leaderId,
        updatedAt: new Date(),
      })
      .where(eq(squads.id, squadId))
      .returning();

    return NextResponse.json(updatedSquad);
  } catch (error) {
    console.error("Error updating squad:", error);
    return NextResponse.json(
      { error: "Failed to update squad" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAuthWithRole(["admin"]);

    const { id: squadId } = await params;

    // Check if squad exists
    const existingSquad = await db
      .select()
      .from(squads)
      .where(eq(squads.id, squadId))
      .limit(1);

    if (existingSquad.length === 0) {
      return NextResponse.json({ error: "Squad not found" }, { status: 404 });
    }

    // Delete squad (squad members will be automatically deleted due to CASCADE)
    await db.delete(squads).where(eq(squads.id, squadId));

    return NextResponse.json({ message: "Squad deleted successfully" });
  } catch (error) {
    console.error("Error deleting squad:", error);
    return NextResponse.json(
      { error: "Failed to delete squad" },
      { status: 500 },
    );
  }
}
