"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface User {
  id: string;
  name: string | null;
  email: string;
  role: "admin" | "leader" | "member";
}

interface DeleteUserDialogProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleteUser: (userId: string) => void;
}

export function DeleteUserDialog({
  user,
  open,
  onOpenChange,
  onDeleteUser,
}: DeleteUserDialogProps) {
  const handleDelete = () => {
    onDeleteUser(user.id);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete User</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this user? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="bg-muted/50 rounded-lg border p-4">
            <div className="space-y-2">
              <div>
                <span className="font-medium">Name:</span> {user.name ?? "N/A"}
              </div>
              <div>
                <span className="font-medium">Email:</span> {user.email}
              </div>
              <div>
                <span className="font-medium">Role:</span>{" "}
                <span className="capitalize">{user.role}</span>
              </div>
            </div>
          </div>

          <div className="bg-destructive/10 border-destructive/20 mt-4 rounded-lg border p-3">
            <p className="text-destructive text-sm">
              <strong>Warning:</strong> Deleting this user will:
            </p>
            <ul className="text-destructive mt-1 ml-4 list-disc text-sm">
              <li>Permanently remove their account</li>
              <li>Revoke all their access permissions</li>
              <li>Delete all associated data</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="button" variant="destructive" onClick={handleDelete}>
            Delete User
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
