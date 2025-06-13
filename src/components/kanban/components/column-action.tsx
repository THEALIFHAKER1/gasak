"use client";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import * as React from "react";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTaskStore } from "../utils/api-store";
import type { UniqueIdentifier } from "@dnd-kit/core";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function ColumnActions({
  title,
  id,
  color,
}: {
  title: string;
  id: UniqueIdentifier;
  color?: string;
}) {
  const [name, setName] = React.useState(title);
  const [columnColor, setColumnColor] = React.useState(color ?? "#6b7280");
  const updateCol = useTaskStore((state) => state.updateCol);
  const removeCol = useTaskStore((state) => state.removeCol);
  const [showEditDialog, setShowEditDialog] = React.useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);

  // Reset form when dialog opens
  React.useEffect(() => {
    if (showEditDialog) {
      setName(title);
      setColumnColor(color ?? "#6b7280");
    }
  }, [showEditDialog, title, color]);

  const handleEdit = async () => {
    try {
      await updateCol(id, name, columnColor);
      setShowEditDialog(false);
      toast("Column updated successfully");
    } catch (error) {
      console.error("Failed to update column:", error);
      toast.error("Failed to update column");
    }
  };

  return (
    <>
      {/* Column Title Display */}
      <div className="flex-1 text-center">
        <span className="font-semibold">{title}</span>
      </div>

      {/* Actions Dropdown */}
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" className="ml-1">
            <span className="sr-only">Actions</span>
            <DotsHorizontalIcon className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => setShowEditDialog(true)}>
            Edit Column
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={() => setShowDeleteDialog(true)}
            className="text-red-600"
          >
            Delete Section
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit Column Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Column</DialogTitle>
            <DialogDescription>
              Update the column name and color.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="column-name">Column Name</Label>
              <Input
                id="column-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter column name..."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="column-color">Color</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  id="column-color"
                  value={columnColor}
                  onChange={(e) => setColumnColor(e.target.value)}
                  className="h-10 w-16 rounded border"
                />
                <span className="text-muted-foreground text-sm">
                  {columnColor}
                </span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={!name.trim()}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure want to delete column?
            </AlertDialogTitle>
            <AlertDialogDescription>
              NOTE: All tasks related to this category will also be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={async () => {
                setTimeout(() => (document.body.style.pointerEvents = ""), 100);
                setShowDeleteDialog(false);
                try {
                  await removeCol(id);
                  toast("This column has been deleted.");
                } catch (error) {
                  console.error("Failed to delete column:", error);
                  toast.error("Failed to delete column");
                }
              }}
            >
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
