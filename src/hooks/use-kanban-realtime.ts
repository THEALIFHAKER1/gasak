import { useEffect, useRef, useCallback } from "react";
import { useTaskStore } from "../components/kanban/utils/api-store";

type KanbanUpdateType =
  | "task_created"
  | "task_updated"
  | "task_deleted"
  | "column_created"
  | "column_updated"
  | "column_deleted"
  | "board_updated";

interface KanbanUpdate extends Record<string, unknown> {
  type: KanbanUpdateType;
  data: Record<string, unknown>;
  boardId?: string;
  userId?: string;
}

export function useKanbanRealtime() {
  const eventSourceRef = useRef<EventSource | null>(null);
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { loadTasks, loadColumns, loadBoards, currentBoardId } = useTaskStore();

  const handleUpdate = useCallback(
    (update: KanbanUpdate) => {
      // Only process updates for the current board
      if (update.boardId && update.boardId !== currentBoardId) {
        return;
      }

      // Clear any existing timeout
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }

      // Debounce updates to prevent conflicts with drag operations
      updateTimeoutRef.current = setTimeout(() => {
        switch (update.type) {
          case "task_created":
          case "task_updated":
          case "task_deleted":
            // Reload tasks when any task changes
            if (currentBoardId) {
              void loadTasks(currentBoardId);
            }
            break;

          case "column_created":
          case "column_updated":
          case "column_deleted":
            // Reload columns when any column changes
            if (currentBoardId) {
              void loadColumns(currentBoardId);
            }
            break;

          case "board_updated":
            // Reload boards when board structure changes
            void loadBoards();
            break;
        }
      }, 500); // 500ms debounce
    },
    [currentBoardId, loadTasks, loadColumns, loadBoards],
  );

  const connect = useCallback(() => {
    if (eventSourceRef.current) {
      return; // Already connected
    }

    try {
      const eventSource = new EventSource("/api/admin/kanban/ws");
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        console.log("SSE connection opened");
      };
      eventSource.onmessage = (event) => {
        try {
          const eventData = event.data as string;
          const update = JSON.parse(eventData) as KanbanUpdate;
          handleUpdate(update);
        } catch (error) {
          console.error("Error parsing SSE message:", error);
        }
      };

      eventSource.onerror = (error) => {
        console.error("SSE connection error:", error);
        // Reconnect after a delay
        setTimeout(() => {
          if (eventSourceRef.current) {
            eventSourceRef.current.close();
            eventSourceRef.current = null;
            connect();
          }
        }, 5000);
      };
    } catch (error) {
      console.error("Error creating SSE connection:", error);
    }
  }, [handleUpdate]);
  const disconnect = useCallback(() => {
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      console.log("SSE connection closed");
    }
  }, []);

  // Auto-connect on mount, disconnect on unmount
  useEffect(() => {
    connect();
    return disconnect;
  }, [connect, disconnect]);

  // Reconnect when board changes
  useEffect(() => {
    if (currentBoardId && eventSourceRef.current) {
      // Connection is already established, just handle the board change
      console.log(`Board changed to: ${currentBoardId}`);
    }
  }, [currentBoardId]);
  return {
    connect,
    disconnect,
    isConnected: !!eventSourceRef.current,
  };
}
