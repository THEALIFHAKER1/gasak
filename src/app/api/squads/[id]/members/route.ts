import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { squads, squadMembers, users } from "@/db/schema";
import { requireAuthWithRole, getUserRole } from "@/utils/auth";
import { eq } from "drizzle-orm";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireAuthWithRole(["admin", "leader"]);
    const userRole = await getUserRole();
    const { id: squadId } = await params;

    const body = (await req.json()) as { userId: string };
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

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

    // Check if user exists and has member role
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (user.length === 0 || user[0]?.role !== "member") {
      return NextResponse.json(
        { error: "Invalid user. Only members can be added to squads" },
        { status: 400 },
      );
    }

    // Check if user is already in any squad
    const existingMembership = await db
      .select()
      .from(squadMembers)
      .where(eq(squadMembers.userId, userId))
      .limit(1);

    if (existingMembership.length > 0) {
      return NextResponse.json(
        { error: "User is already a member of another squad" },
        { status: 400 },
      );
    }

    // Add user to squad
    const [newMember] = await db
      .insert(squadMembers)
      .values({
        userId,
        squadId,
      })
      .returning();

    return NextResponse.json(newMember, { status: 201 });
  } catch (error) {
    console.error("Error adding squad member:", error);
    return NextResponse.json(
      { error: "Failed to add squad member" },
      { status: 500 },
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userRole = await getUserRole();
    if (!userRole) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: squadId } = await params;

    // Check if squad exists
    const squad = await db
      .select()
      .from(squads)
      .where(eq(squads.id, squadId))
      .limit(1);

    if (squad.length === 0) {
      return NextResponse.json({ error: "Squad not found" }, { status: 404 });
    }

    // If user is leader, they can only view their own squad members
    if (userRole === "leader") {
      const session = await requireAuthWithRole(["leader"]);
      if (squad[0]!.leaderId !== session.user.id) {
        return NextResponse.json(
          { error: "Leaders can only view their own squad members" },
          { status: 403 },
        );
      }
    }

    // Get squad members
    const members = await db
      .select({
        id: squadMembers.id,
        userId: squadMembers.userId,
        userName: users.name,
        userIgn: users.ign,
        userEmail: users.email,
        joinedAt: squadMembers.joinedAt,
      })
      .from(squadMembers)
      .innerJoin(users, eq(squadMembers.userId, users.id))
      .where(eq(squadMembers.squadId, squadId));

    return NextResponse.json(members);
  } catch (error) {
    console.error("Error fetching squad members:", error);
    return NextResponse.json(
      { error: "Failed to fetch squad members" },
      { status: 500 },
    );
  }
}
