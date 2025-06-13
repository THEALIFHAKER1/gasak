import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { squads, users } from "@/db/schema";
import { requireAuthWithRole } from "@/utils/auth";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    await requireAuthWithRole(["admin"]);

    const body = (await req.json()) as { name?: string; leaderId?: string };
    const { name, leaderId } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Squad name is required" },
        { status: 400 },
      );
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

    const [newSquad] = await db
      .insert(squads)
      .values({
        name,
        leaderId: leaderId ?? null,
      })
      .returning();

    return NextResponse.json(newSquad, { status: 201 });
  } catch (error) {
    console.error("Error creating squad:", error);
    return NextResponse.json(
      { error: "Failed to create squad" },
      { status: 500 },
    );
  }
}
