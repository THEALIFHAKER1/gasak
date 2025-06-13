import { create } from "zustand";
import { type UniqueIdentifier } from "@dnd-kit/core";

export type Status = "TODO" | "IN_PROGRESS" | "DONE";

export interface Column {
  id: UniqueIdentifier;
  title: string;
  color?: string;
}

export type Task = {
  id: string;
  title: string;
  description?: string;
  status: Status;
  columnId: string;
  boardId: string;
  userId: string;
  createdById: string;
  assignedToId?: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
  // Populated user data
  createdBy?: { id: string; name: string; email: string };
  assignedTo?: { id: string; name: string; email: string };
};

export type Board = {
  id: string;
  title: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type ColumnType = {
  id: string;
  title: string;
  color?: string;
  boardId: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
};

export type User = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "leader" | "member";
};

export type State = {
  tasks: Task[];
  columns: Column[];
  boards: Board[];
  users: User[];
  currentBoardId: string | null;
  draggedTask: string | null;
  isLoading: boolean;
  error: string | null;
};

export type Actions = {
  // Board actions
  loadBoards: () => Promise<void>;
  createBoard: (title: string) => Promise<void>;
  setCurrentBoard: (boardId: string) => void;
  // Column actions
  loadColumns: (boardId: string) => Promise<void>;
  addCol: (title: string, color?: string) => Promise<void>;
  updateCol: (
    id: UniqueIdentifier,
    newName: string,
    color?: string,
  ) => Promise<void>;
  removeCol: (id: UniqueIdentifier) => Promise<void>;
  // Task actions
  loadTasks: (boardId: string) => Promise<void>;
  addTask: (
    title: string,
    description?: string,
    assignedToId?: string,
  ) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  removeTask: (id: string) => Promise<void>;
  bulkUpdateTasks: (
    tasks: Array<{
      id: string;
      status?: string;
      columnId?: string;
      order?: number;
    }>,
  ) => Promise<void>;

  // User actions
  loadUsers: () => Promise<void>;

  // UI actions
  dragTask: (id: string | null) => void;
  setTasks: (updatedTask: Task[]) => void;
  setCols: (cols: Column[]) => void;

  // Error handling
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
};

const API_BASE = "/api/admin/kanban";

export const useTaskStore = create<State & Actions>((set, get) => ({
  tasks: [],
  columns: [],
  boards: [],
  users: [],
  currentBoardId: null,
  draggedTask: null,
  isLoading: false,
  error: null,

  setError: (error) => set({ error }),
  setLoading: (isLoading) => set({ isLoading }),
  dragTask: (id) => set({ draggedTask: id }),
  setTasks: (tasks) => set({ tasks }),
  setCols: (columns) => set({ columns }),
  setCurrentBoard: (boardId) => set({ currentBoardId: boardId }),

  loadBoards: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE}/boards`);
      if (!response.ok) {
        throw new Error("Failed to load boards");
      }
      const boards = (await response.json()) as Board[];
      set({ boards, isLoading: false });
      // Set first board as current if none selected
      if (boards.length > 0 && !get().currentBoardId && boards[0]) {
        set({ currentBoardId: boards[0].id });
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Unknown error",
        isLoading: false,
      });
    }
  },
  createBoard: async (title) => {
    set({ isLoading: true, error: null });
    try {
      console.log("Creating board with title:", title);
      const response = await fetch(`${API_BASE}/boards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      if (!response.ok) {
        const errorData = await response.text();
        console.error("Error response:", errorData);
        throw new Error(
          `Failed to create board: ${response.status} ${errorData}`,
        );
      }

      const newBoard = (await response.json()) as Board;
      console.log("Board created successfully:", newBoard);

      set((state) => ({
        boards: [...state.boards, newBoard],
        currentBoardId: newBoard.id,
        isLoading: false,
      }));

      // Load columns for the new board
      await get().loadColumns(newBoard.id);
    } catch (error) {
      console.error("Create board error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      set({ error: errorMessage, isLoading: false });
      throw error; // Re-throw so the wrapper can handle it
    }
  },

  loadColumns: async (boardId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE}/columns?boardId=${boardId}`);
      if (!response.ok) {
        throw new Error("Failed to load columns");
      }
      const columnsData = (await response.json()) as ColumnType[];
      const columns = columnsData.map((col) => ({
        id: col.id,
        title: col.title,
        color: col.color,
      }));
      set({ columns, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Unknown error",
        isLoading: false,
      });
    }
  },

  loadTasks: async (boardId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE}/tasks?boardId=${boardId}`);
      if (!response.ok) {
        throw new Error("Failed to load tasks");
      }
      const tasks = (await response.json()) as Task[];
      set({ tasks, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Unknown error",
        isLoading: false,
      });
    }
  },
  addTask: async (title, description, assignedToId) => {
    const { currentBoardId, columns } = get();
    if (!currentBoardId) {
      set({ error: "No board selected" });
      return;
    }

    if (columns.length === 0) {
      set({ error: "No columns available. Please create a column first." });
      return;
    }

    // Use the first available column
    const firstColumn = columns[0];
    if (!firstColumn) {
      set({ error: "No columns available. Please create a column first." });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          status: String(firstColumn.id),
          columnId: String(firstColumn.id),
          boardId: currentBoardId,
          assignedToId,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to create task");
      }
      const newTask = (await response.json()) as Task;
      set((state) => ({
        tasks: [...state.tasks, newTask],
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Unknown error",
        isLoading: false,
      });
    }
  },
  addCol: async (title, color) => {
    const { currentBoardId, columns } = get();
    if (!currentBoardId) {
      set({ error: "No board selected" });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const columnId = columns.length
        ? title.toUpperCase().replace(/\s+/g, "_")
        : "TODO";
      const response = await fetch(`${API_BASE}/columns`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: columnId,
          title,
          color: color ?? "#6b7280", // Default color if not provided
          boardId: currentBoardId,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to create column");
      }
      const newColumnData = (await response.json()) as ColumnType;
      const newColumn: Column = {
        id: newColumnData.id,
        title: newColumnData.title,
        color: newColumnData.color,
      };
      set((state) => ({
        columns: [...state.columns, newColumn],
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Unknown error",
        isLoading: false,
      });
    }
  },
  updateCol: async (id, newName, color) => {
    set({ isLoading: true, error: null });
    try {
      const updateData: { title: string; color?: string } = { title: newName };
      if (color !== undefined) {
        updateData.color = color;
      }

      const response = await fetch(`${API_BASE}/columns/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });
      if (!response.ok) {
        throw new Error("Failed to update column");
      }
      const updatedColumnData = (await response.json()) as ColumnType;
      set((state) => ({
        columns: state.columns.map((col) =>
          col.id === id
            ? {
                ...col,
                title: updatedColumnData.title,
                color: updatedColumnData.color,
              }
            : col,
        ),
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Unknown error",
        isLoading: false,
      });
    }
  },

  removeCol: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE}/columns/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete column");
      }
      set((state) => ({
        columns: state.columns.filter((col) => col.id !== id),
        tasks: state.tasks.filter((task) => task.columnId !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Unknown error",
        isLoading: false,
      });
    }
  },

  updateTask: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE}/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!response.ok) {
        throw new Error("Failed to update task");
      }
      const updatedTask = (await response.json()) as Task;
      set((state) => ({
        tasks: state.tasks.map((task) => (task.id === id ? updatedTask : task)),
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Unknown error",
        isLoading: false,
      });
    }
  },

  removeTask: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE}/tasks/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete task");
      }
      set((state) => ({
        tasks: state.tasks.filter((task) => task.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Unknown error",
        isLoading: false,
      });
    }
  },

  bulkUpdateTasks: async (tasksToUpdate) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE}/tasks/bulk`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tasks: tasksToUpdate }),
      });
      if (!response.ok) {
        throw new Error("Failed to bulk update tasks");
      }
      const updatedTasks = (await response.json()) as Task[];
      set((state) => {
        const taskMap = new Map(updatedTasks.map((task) => [task.id, task]));
        return {
          tasks: state.tasks.map((task) => taskMap.get(task.id) ?? task),
          isLoading: false,
        };
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Unknown error",
        isLoading: false,
      });
    }
  },

  loadUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE}/users`);
      if (!response.ok) {
        throw new Error("Failed to load users");
      }
      const users = (await response.json()) as User[];
      set({ users, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Unknown error",
        isLoading: false,
      });
    }
  },
}));
