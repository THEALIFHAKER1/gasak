import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { kanbanBoards } from "@/db/schema";
import { eq } from "drizzle-orm";

// GET - Fetch all boards for the current user
export async function GET() {
  try {
    const session = await auth();
    console.log("Boards GET - Session:", !!session, session?.user?.id);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const boards = await db
      .select()
      .from(kanbanBoards)
      .where(eq(kanbanBoards.userId, session.user.id));

    console.log("Boards found:", boards.length);
    return NextResponse.json(boards);
  } catch (error) {
    console.error("Error fetching boards:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST - Create a new board (simplified)
export async function POST(request: Request) {
  try {
    const session = await auth();
    console.log("Boards POST - Session:", !!session, session?.user?.id);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = (await request.json()) as { title: string };
    console.log("Request body:", body);

    const { title } = body;
    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    console.log("Creating board:", title);

    const [newBoard] = await db
      .insert(kanbanBoards)
      .values({
        title,
        userId: session.user.id,
      })
      .returning();

    console.log("Board created:", newBoard);
    return NextResponse.json(newBoard, { status: 201 });
  } catch (error) {
    console.error("Error creating board:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
