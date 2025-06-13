"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { Squad } from "@/types";

interface DeleteSquadDialogProps {
  children: React.ReactNode;
  squad: Squad;
  onSquadDeleted: () => void;
}

export function DeleteSquadDialog({
  children,
  squad,
  onSquadDeleted,
}: DeleteSquadDialogProps) {
  const [loading, setLoading] = useState(false);
  const handleDelete = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/squads/${squad.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = (await response.json()) as { error?: string };
        throw new Error(error.error ?? "Failed to delete squad");
      }

      onSquadDeleted();
    } catch (error) {
      console.error("Error deleting squad:", error);
      alert(error instanceof Error ? error.message : "Failed to delete squad");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Squad</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete &quot;{squad.name}&quot;? This
            action cannot be undone. All squad members will be removed from the
            squad.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? "Deleting..." : "Delete Squad"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
