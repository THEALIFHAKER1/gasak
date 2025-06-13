import { NextResponse } from "next/server";
import { db } from "@/db";
import { kanbanTasks, kanbanBoards, users } from "@/db/schema";
import { auth } from "@/auth";
import { eq, and } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { broadcastUpdate } from "@/lib/sse-manager";

type UpdateTaskBody = {
  title?: string;
  description?: string;
  status?: string;
  columnId?: string;
  order?: number;
};

// PUT - Update a task
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = (await request.json()) as UpdateTaskBody;
    const { id } = await params;

    let whereCondition;
    if (session.user.role === "admin") {
      // Admins can update any task on admin boards
      // First get the task to check if it's on an admin board
      const taskWithBoard = await db
        .select({
          task: kanbanTasks,
          boardOwner: users.role,
        })
        .from(kanbanTasks)
        .innerJoin(kanbanBoards, eq(kanbanTasks.boardId, kanbanBoards.id))
        .innerJoin(users, eq(kanbanBoards.userId, users.id))
        .where(eq(kanbanTasks.id, id))
        .limit(1);
      if (
        taskWithBoard.length === 0 ||
        taskWithBoard[0]?.boardOwner !== "admin"
      ) {
        return NextResponse.json(
          { error: "Task not found or access denied" },
          { status: 404 },
        );
      }

      whereCondition = eq(kanbanTasks.id, id);
    } else {
      // Non-admins can only update their own tasks
      whereCondition = and(
        eq(kanbanTasks.id, id),
        eq(kanbanTasks.userId, session.user.id),
      );
    }
    const [updatedTask] = await db
      .update(kanbanTasks)
      .set({
        ...body,
        updatedAt: new Date(),
      })
      .where(whereCondition)
      .returning();

    if (!updatedTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Fetch the updated task with populated user data
    const creator = alias(users, "creator");
    const assignee = alias(users, "assignee");

    const [taskWithUsers] = await db
      .select({
        id: kanbanTasks.id,
        title: kanbanTasks.title,
        description: kanbanTasks.description,
        status: kanbanTasks.status,
        columnId: kanbanTasks.columnId,
        boardId: kanbanTasks.boardId,
        userId: kanbanTasks.userId,
        createdById: kanbanTasks.createdById,
        assignedToId: kanbanTasks.assignedToId,
        order: kanbanTasks.order,
        createdAt: kanbanTasks.createdAt,
        updatedAt: kanbanTasks.updatedAt,
        createdByName: creator.name,
        createdByEmail: creator.email,
        assignedToName: assignee.name,
        assignedToEmail: assignee.email,
      })
      .from(kanbanTasks)
      .leftJoin(creator, eq(kanbanTasks.createdById, creator.id))
      .leftJoin(assignee, eq(kanbanTasks.assignedToId, assignee.id))
      .where(eq(kanbanTasks.id, updatedTask.id))
      .limit(1);

    if (!taskWithUsers) {
      return NextResponse.json(updatedTask);
    }

    // Transform the data to include nested user objects
    const taskWithNestedUsers = {
      ...taskWithUsers,
      createdBy: taskWithUsers.createdByName
        ? {
            id: taskWithUsers.createdById,
            name: taskWithUsers.createdByName,
            email: taskWithUsers.createdByEmail,
          }
        : undefined,
      assignedTo: taskWithUsers.assignedToName
        ? {
            id: taskWithUsers.assignedToId!,
            name: taskWithUsers.assignedToName,
            email: taskWithUsers.assignedToEmail,
          }
        : undefined,
      // Remove the separate fields
      createdByName: undefined,
      createdByEmail: undefined,
      assignedToName: undefined,
      assignedToEmail: undefined,
    };

    // Broadcast the update to other users
    broadcastUpdate(
      {
        type: "task_updated",
        data: taskWithNestedUsers,
        boardId: taskWithNestedUsers.boardId,
      },
      session.user.id,
    );

    return NextResponse.json(taskWithNestedUsers);
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// DELETE - Delete a task
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

    let whereCondition;
    if (session.user.role === "admin") {
      // Admins can delete any task on admin boards
      // First get the task to check if it's on an admin board
      const taskWithBoard = await db
        .select({
          task: kanbanTasks,
          boardOwner: users.role,
        })
        .from(kanbanTasks)
        .innerJoin(kanbanBoards, eq(kanbanTasks.boardId, kanbanBoards.id))
        .innerJoin(users, eq(kanbanBoards.userId, users.id))
        .where(eq(kanbanTasks.id, id))
        .limit(1);

      if (
        taskWithBoard.length === 0 ||
        taskWithBoard[0]?.boardOwner !== "admin"
      ) {
        return NextResponse.json(
          { error: "Task not found or access denied" },
          { status: 404 },
        );
      }

      whereCondition = eq(kanbanTasks.id, id);
    } else {
      // Non-admins can only delete their own tasks
      whereCondition = and(
        eq(kanbanTasks.id, id),
        eq(kanbanTasks.userId, session.user.id),
      );
    }

    const [deletedTask] = await db
      .delete(kanbanTasks)
      .where(whereCondition)
      .returning();

    if (!deletedTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
