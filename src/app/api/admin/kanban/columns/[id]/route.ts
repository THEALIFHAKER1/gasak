import { NextResponse } from "next/server";
import { db } from "@/db";
import { kanbanColumns } from "@/db/schema";
import { auth } from "@/auth";
import { eq } from "drizzle-orm";
import { broadcastUpdate } from "@/lib/sse-manager";

type UpdateColumnBody = {
  title?: string;
  color?: string;
  order?: number;
};

// PUT - Update a column
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as UpdateColumnBody;
    const { id } = await params;

    const [updatedColumn] = await db
      .update(kanbanColumns)
      .set({
        ...body,
        updatedAt: new Date(),
      })
      .where(eq(kanbanColumns.id, id))
      .returning();

    if (!updatedColumn) {
      return NextResponse.json({ error: "Column not found" }, { status: 404 });
    }

    // Broadcast the update to other users
    broadcastUpdate(
      {
        type: "column_updated",
        data: updatedColumn,
        boardId: updatedColumn.boardId,
      },
      session.user.id,
    );

    return NextResponse.json(updatedColumn);
  } catch (error) {
    console.error("Error updating column:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// DELETE - Delete a column
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const [deletedColumn] = await db
      .delete(kanbanColumns)
      .where(eq(kanbanColumns.id, id))
      .returning();

    if (!deletedColumn) {
      return NextResponse.json({ error: "Column not found" }, { status: 404 });
    }

    // Broadcast the deletion to other users
    broadcastUpdate(
      {
        type: "column_deleted",
        data: { id: deletedColumn.id },
        boardId: deletedColumn.boardId,
      },
      session.user.id,
    );

    return NextResponse.json({ message: "Column deleted successfully" });
  } catch (error) {
    console.error("Error deleting column:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
