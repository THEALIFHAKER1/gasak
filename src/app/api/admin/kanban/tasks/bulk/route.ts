import { NextResponse } from "next/server";
import { db } from "@/db";
import { kanbanTasks, kanbanBoards, users } from "@/db/schema";
import { auth } from "@/auth";
import { eq, and, inArray } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { broadcastUpdate } from "@/lib/sse-manager";

type BulkUpdateTask = {
  id: string;
  status?: string;
  columnId?: string;
  order?: number;
};

type BulkUpdateBody = {
  tasks: BulkUpdateTask[];
};

// PUT - Bulk update tasks (for drag and drop)
export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as BulkUpdateBody;
    const { tasks } = body;

    if (!Array.isArray(tasks)) {
      return NextResponse.json(
        { error: "Tasks array is required" },
        { status: 400 },
      );
    } // Update tasks in a transaction
    const updatedTasks = [];

    for (const task of tasks) {
      let whereCondition;

      if (session.user.role === "admin") {
        // Admins can update any task on admin boards
        // First verify the task is on an admin board
        const taskWithBoard = await db
          .select({
            task: kanbanTasks,
            boardOwner: users.role,
          })
          .from(kanbanTasks)
          .innerJoin(kanbanBoards, eq(kanbanTasks.boardId, kanbanBoards.id))
          .innerJoin(users, eq(kanbanBoards.userId, users.id))
          .where(eq(kanbanTasks.id, task.id))
          .limit(1);

        if (
          taskWithBoard.length === 0 ||
          taskWithBoard[0]?.boardOwner !== "admin"
        ) {
          continue; // Skip this task if not found or not on admin board
        }

        whereCondition = eq(kanbanTasks.id, task.id);
      } else {
        // Non-admins can only update their own tasks
        whereCondition = and(
          eq(kanbanTasks.id, task.id),
          eq(kanbanTasks.userId, session.user.id),
        );
      }

      const [updatedTask] = await db
        .update(kanbanTasks)
        .set({
          status: task.status,
          columnId: task.columnId,
          order: task.order,
          updatedAt: new Date(),
        })
        .where(whereCondition)
        .returning();
      if (updatedTask) {
        updatedTasks.push(updatedTask);
      }
    }

    // Fetch all updated tasks with populated user data
    if (updatedTasks.length > 0) {
      const creator = alias(users, "creator");
      const assignee = alias(users, "assignee");
      const taskIds = updatedTasks.map((t) => t.id);

      const tasksWithUsers = await db
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
        .where(inArray(kanbanTasks.id, taskIds));

      // Transform the data to include nested user objects
      const tasksWithNestedUsers = tasksWithUsers.map((task) => ({
        ...task,
        createdBy: task.createdByName
          ? {
              id: task.createdById,
              name: task.createdByName,
              email: task.createdByEmail,
            }
          : undefined,
        assignedTo: task.assignedToName
          ? {
              id: task.assignedToId!,
              name: task.assignedToName,
              email: task.assignedToEmail,
            }
          : undefined,
        // Remove the separate fields
        createdByName: undefined,
        createdByEmail: undefined,
        assignedToName: undefined,
        assignedToEmail: undefined,
      }));

      // Broadcast the bulk update to other users
      broadcastUpdate(
        {
          type: "task_updated",
          data: { tasks: tasksWithNestedUsers },
          boardId: tasksWithNestedUsers[0]?.boardId,
        },
        session.user.id,
      );

      return NextResponse.json(tasksWithNestedUsers);
    }

    // Broadcast the bulk update to other users
    broadcastUpdate(
      {
        type: "task_updated",
        data: { tasks: updatedTasks },
        boardId: updatedTasks[0]?.boardId,
      },
      session.user.id,
    );

    return NextResponse.json(updatedTasks);
  } catch (error) {
    console.error("Error bulk updating tasks:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
