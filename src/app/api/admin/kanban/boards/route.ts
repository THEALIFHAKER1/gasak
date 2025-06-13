import { NextResponse } from "next/server";
import { db } from "@/db";
import { kanbanBoards, kanbanColumns, users } from "@/db/schema";
import { auth } from "@/auth";
import { eq } from "drizzle-orm";

type CreateBoardBody = {
  title: string;
};

// GET - Fetch all boards (shared for admins, personal for others)
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    let boards;
    if (session.user.role === "admin") {
      // Admins see all boards created by any admin
      boards = await db
        .select({
          id: kanbanBoards.id,
          title: kanbanBoards.title,
          userId: kanbanBoards.userId,
          createdAt: kanbanBoards.createdAt,
          updatedAt: kanbanBoards.updatedAt,
        })
        .from(kanbanBoards)
        .innerJoin(users, eq(kanbanBoards.userId, users.id))
        .where(eq(users.role, "admin"))
        .orderBy(kanbanBoards.createdAt);
    } else {
      // Leaders and members see only their own boards
      boards = await db
        .select()
        .from(kanbanBoards)
        .where(eq(kanbanBoards.userId, session.user.id))
        .orderBy(kanbanBoards.createdAt);
    }

    return NextResponse.json(boards);
  } catch (error) {
    console.error("Error fetching boards:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST - Create a new board with default columns
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = (await request.json()) as CreateBoardBody;
    const { title } = body;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    console.log(
      "Creating board with title:",
      title,
      "for user:",
      session.user.id,
    );

    // Create the board
    const [newBoard] = await db
      .insert(kanbanBoards)
      .values({
        title,
        userId: session.user.id,
      })
      .returning();
    if (!newBoard) {
      console.error("Failed to create board - no board returned");
      return NextResponse.json(
        { error: "Failed to create board" },
        { status: 500 },
      );
    }

    console.log("Board created:", newBoard);

    // Create default columns
    const defaultColumns = [
      { id: "TODO", title: "Todo", order: 0 },
      { id: "IN_PROGRESS", title: "In Progress", order: 1 },
      { id: "DONE", title: "Done", order: 2 },
    ];

    const columnsToInsert = defaultColumns.map((col) => ({
      ...col,
      boardId: newBoard.id,
    }));

    console.log("Inserting columns:", columnsToInsert);

    await db.insert(kanbanColumns).values(columnsToInsert);

    console.log("Board and columns created successfully");

    return NextResponse.json(newBoard, { status: 201 });
  } catch (error) {
    console.error("Error creating board:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
