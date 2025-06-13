import { NextResponse } from "next/server";
import { db } from "@/db";
import { kanbanTasks, kanbanBoards, users } from "@/db/schema";
import { auth } from "@/auth";
import { eq, and } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { broadcastUpdate } from "@/lib/sse-manager";

type CreateTaskBody = {
  title: string;
  description?: string;
  status: string;
  columnId: string;
  boardId: string;
  assignedToId?: string;
};

// GET - Fetch all tasks for a board
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

    let tasks;
    if (session.user.role === "admin") {
      // Admins can see all tasks from any admin board
      // First verify the board belongs to an admin
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
      } // Get all tasks for this admin board with user info
      const creator = alias(users, "creator");
      const assignee = alias(users, "assignee");

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
        .where(eq(kanbanTasks.boardId, boardId))
        .orderBy(kanbanTasks.order);

      // Transform the data to include nested user objects
      tasks = tasksWithUsers.map((task) => ({
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
    } else {
      // Non-admins only see their own tasks
      tasks = await db
        .select()
        .from(kanbanTasks)
        .where(
          and(
            eq(kanbanTasks.boardId, boardId),
            eq(kanbanTasks.userId, session.user.id),
          ),
        )
        .orderBy(kanbanTasks.order);
    }

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST - Create a new task
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = (await request.json()) as CreateTaskBody;
    const { title, description, status, columnId, boardId, assignedToId } =
      body;

    if (!title || !status || !columnId || !boardId) {
      return NextResponse.json(
        { error: "Title, status, columnId, and boardId are required" },
        { status: 400 },
      );
    }

    // Get the next order position
    const existingTasks = await db
      .select()
      .from(kanbanTasks)
      .where(
        and(
          eq(kanbanTasks.columnId, columnId),
          eq(kanbanTasks.boardId, boardId),
          eq(kanbanTasks.userId, session.user.id),
        ),
      );
    const nextOrder = existingTasks.length;
    const [newTask] = await db
      .insert(kanbanTasks)
      .values({
        title,
        description,
        status,
        columnId,
        boardId,
        userId: session.user.id,
        createdById: session.user.id,
        assignedToId: assignedToId ?? null,
        order: nextOrder,
      })
      .returning();

    if (!newTask) {
      return NextResponse.json(
        { error: "Failed to create task" },
        { status: 500 },
      );
    }

    // Fetch the task with populated user data
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
      .where(eq(kanbanTasks.id, newTask.id))
      .limit(1);

    if (!taskWithUsers) {
      return NextResponse.json(newTask, { status: 201 });
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
        type: "task_created",
        data: taskWithNestedUsers,
        boardId: taskWithNestedUsers.boardId,
      },
      session.user.id,
    );

    return NextResponse.json(taskWithNestedUsers, { status: 201 });
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
