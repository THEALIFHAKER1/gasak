import { NextResponse } from "next/server";
import { db } from "@/db";
import { kanbanColumns, kanbanBoards, users } from "@/db/schema";
import { auth } from "@/auth";
import { eq, and } from "drizzle-orm";
import { broadcastUpdate } from "@/lib/sse-manager";

type CreateColumnBody = {
  id: string;
  title: string;
  color?: string;
  boardId: string;
};

// GET - Fetch all columns for a board
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const boardId = searchParams.get("boardId");

    if (!boardId) {
      return NextResponse.json(
        { error: "Board ID is required" },
        { status: 400 },
      );
    }

    // Verify board access - admins can access any admin board, others only their own
    if (session.user.role !== "admin") {
      const board = await db
        .select()
        .from(kanbanBoards)
        .where(
          and(
            eq(kanbanBoards.id, boardId),
            eq(kanbanBoards.userId, session.user.id),
          ),
        )
        .limit(1);

      if (board.length === 0) {
        return NextResponse.json(
          { error: "Board not found or access denied" },
          { status: 404 },
        );
      }
    } else {
      // For admins, verify the board exists and belongs to an admin
      const board = await db
        .select()
        .from(kanbanBoards)
        .innerJoin(users, eq(kanbanBoards.userId, users.id))
        .where(and(eq(kanbanBoards.id, boardId), eq(users.role, "admin")))
        .limit(1);

      if (board.length === 0) {
        return NextResponse.json(
          { error: "Board not found or access denied" },
          { status: 404 },
        );
      }
    }

    const columns = await db
      .select()
      .from(kanbanColumns)
      .where(eq(kanbanColumns.boardId, boardId))
      .orderBy(kanbanColumns.order);

    return NextResponse.json(columns);
  } catch (error) {
    console.error("Error fetching columns:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST - Create a new column
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = (await request.json()) as CreateColumnBody;
    const { id, title, color, boardId } = body;

    if (!id || !title || !boardId) {
      return NextResponse.json(
        { error: "ID, title, and boardId are required" },
        { status: 400 },
      );
    }

    // Get the next order position
    const existingColumns = await db
      .select()
      .from(kanbanColumns)
      .where(eq(kanbanColumns.boardId, boardId));

    const nextOrder = existingColumns.length;
    const [newColumn] = await db
      .insert(kanbanColumns)
      .values({
        id,
        title,
        color: color ?? "#6b7280", // Default color
        boardId,
        order: nextOrder,
      })
      .returning();

    if (newColumn) {
      // Broadcast the update to other users
      broadcastUpdate(
        {
          type: "column_created",
          data: newColumn,
          boardId: newColumn.boardId,
        },
        session.user.id,
      );
    }

    return NextResponse.json(newColumn, { status: 201 });
  } catch (error) {
    console.error("Error creating column:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
