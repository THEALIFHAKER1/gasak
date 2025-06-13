"use client";

import { useEffect, useCallback } from "react";
import { useTaskStore } from "../utils/api-store";
import { KanbanBoard } from "./kanban-board";
import { useKanbanRealtime } from "@/hooks/use-kanban-realtime";

export function KanbanBoardWrapper() {
  const {
    loadBoards,
    loadColumns,
    loadTasks,
    loadUsers,
    currentBoardId,
    createBoard,
    isLoading,
    error,
    boards,
  } = useTaskStore();

  // Enable real-time updates
  useKanbanRealtime();

  const initializeBoard = useCallback(async () => {
    try {
      console.log("Loading boards...");
      await loadBoards();
      await loadUsers(); // Load users for task assignment
      const boardsData = useTaskStore.getState().boards;
      console.log("Boards loaded:", boardsData);

      if (boardsData.length === 0) {
        // Create a default board if none exist
        console.log("No boards found, creating default board...");
        await createBoard("My Kanban Board");
        console.log("Default board created");
      } else {
        const boardId =
          useTaskStore.getState().currentBoardId ?? boardsData[0]?.id;
        console.log("Using board ID:", boardId);
        if (boardId) {
          await loadColumns(boardId);
          await loadTasks(boardId);
        }
      }
    } catch (err) {
      console.error("Failed to initialize board:", err);
    }
  }, [loadBoards, createBoard, loadColumns, loadTasks, loadUsers]);

  useEffect(() => {
    void initializeBoard();
  }, [initializeBoard]);

  useEffect(() => {
    const loadBoardData = async () => {
      if (currentBoardId) {
        try {
          await loadColumns(currentBoardId);
          await loadTasks(currentBoardId);
        } catch (err) {
          console.error("Failed to load board data:", err);
        }
      }
    };

    void loadBoardData();
  }, [currentBoardId, loadColumns, loadTasks]);

  if (isLoading && boards.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-muted-foreground">Loading kanban board...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return <KanbanBoard />;
}
