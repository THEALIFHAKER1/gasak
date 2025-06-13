import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { squads, squadMembers } from "@/db/schema";
import { requireAuthWithRole, getUserRole } from "@/utils/auth";
import { eq, and } from "drizzle-orm";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; uid: string }> },
) {
  try {
    const session = await requireAuthWithRole(["admin", "leader"]);
    const userRole = await getUserRole();
    const { id: squadId, uid: userId } = await params;

    // Check if squad exists
    const squad = await db
      .select()
      .from(squads)
      .where(eq(squads.id, squadId))
      .limit(1);

    if (squad.length === 0) {
      return NextResponse.json({ error: "Squad not found" }, { status: 404 });
    }

    // If user is leader, they can only manage their own squad
    if (userRole === "leader" && squad[0]!.leaderId !== session.user.id) {
      return NextResponse.json(
        { error: "Leaders can only manage their own squad" },
        { status: 403 },
      );
    }

    // Check if user is a member of this squad
    const membership = await db
      .select()
      .from(squadMembers)
      .where(
        and(eq(squadMembers.squadId, squadId), eq(squadMembers.userId, userId)),
      )
      .limit(1);

    if (membership.length === 0) {
      return NextResponse.json(
        { error: "User is not a member of this squad" },
        { status: 404 },
      );
    }

    // Remove user from squad
    await db
      .delete(squadMembers)
      .where(
        and(eq(squadMembers.squadId, squadId), eq(squadMembers.userId, userId)),
      );

    return NextResponse.json({ message: "Member removed successfully" });
  } catch (error) {
    console.error("Error removing squad member:", error);
    return NextResponse.json(
      { error: "Failed to remove squad member" },
      { status: 500 },
    );
  }
}
