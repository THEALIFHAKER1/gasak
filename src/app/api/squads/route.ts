import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { squads, squadMembers, users } from "@/db/schema";
import { requireAuthWithRole, getUserRole } from "@/utils/auth";
import { eq } from "drizzle-orm";

export async function GET(_req: NextRequest) {
  try {
    const userRole = await getUserRole();
    if (!userRole) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let squadsData;

    if (userRole === "admin") {
      // Admin can see all squads
      squadsData = await db
        .select({
          id: squads.id,
          name: squads.name,
          leaderId: squads.leaderId,
          leaderName: users.name,
          leaderIgn: users.ign,
          createdAt: squads.createdAt,
          updatedAt: squads.updatedAt,
        })
        .from(squads)
        .leftJoin(users, eq(squads.leaderId, users.id));
    } else if (userRole === "leader") {
      // Leader can only see their own squad
      const session = await requireAuthWithRole(["leader"]);
      squadsData = await db
        .select({
          id: squads.id,
          name: squads.name,
          leaderId: squads.leaderId,
          leaderName: users.name,
          leaderIgn: users.ign,
          createdAt: squads.createdAt,
          updatedAt: squads.updatedAt,
        })
        .from(squads)
        .leftJoin(users, eq(squads.leaderId, users.id))
        .where(eq(squads.leaderId, session.user.id));
    } else {
      // Members can see all squads (read-only)
      squadsData = await db
        .select({
          id: squads.id,
          name: squads.name,
          leaderId: squads.leaderId,
          leaderName: users.name,
          leaderIgn: users.ign,
          createdAt: squads.createdAt,
          updatedAt: squads.updatedAt,
        })
        .from(squads)
        .leftJoin(users, eq(squads.leaderId, users.id));
    }

    // Fetch members for each squad
    const squadsWithMembers = await Promise.all(
      squadsData.map(async (squad) => {
        const members = await db
          .select({
            id: squadMembers.id,
            userId: squadMembers.userId,
            squadId: squadMembers.squadId,
            userName: users.name,
            userIgn: users.ign,
            userEmail: users.email,
            joinedAt: squadMembers.joinedAt,
          })
          .from(squadMembers)
          .innerJoin(users, eq(squadMembers.userId, users.id))
          .where(eq(squadMembers.squadId, squad.id));

        return {
          ...squad,
          memberCount: members.length,
          members,
        };
      }),
    );

    return NextResponse.json(squadsWithMembers);
  } catch (error) {
    console.error("Error fetching squads:", error);
    return NextResponse.json(
      { error: "Failed to fetch squads" },
      { status: 500 },
    );
  }
}
