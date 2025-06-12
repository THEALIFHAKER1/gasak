import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, ne, count } from "drizzle-orm";

export async function GET() {
  try {
    // Check if user is authenticated and is admin
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Current counts
    const leaderCountResult = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.role, "leader"));

    const memberCountResult = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.role, "member"));

    const totalUsersResult = await db
      .select({ count: count() })
      .from(users)
      .where(ne(users.role, "admin"));

    // Current counts
    const leaderCount = leaderCountResult[0]?.count ?? 0;
    const memberCount = memberCountResult[0]?.count ?? 0;
    const totalUsers = totalUsersResult[0]?.count ?? 0;

    return NextResponse.json({
      leaderCount,
      memberCount,
      totalUsers,
      trends: {
        totalUsers: {
          value: "+0%",
          isPositive: true,
          label: "Stable",
        },
        leaderCount: {
          value: "+0%",
          isPositive: true,
          label: "Stable",
        },
        memberCount: {
          value: "+0%",
          isPositive: true,
          label: "Stable",
        },
      },
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
