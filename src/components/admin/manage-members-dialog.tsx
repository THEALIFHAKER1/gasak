"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import type { Squad, SquadMember } from "@/types";
import { IconUserMinus } from "@tabler/icons-react";

interface User {
  id: string;
  name: string | null;
  ign: string | null;
  role: string;
}

interface ManageMembersDialogProps {
  children: React.ReactNode;
  squad: Squad;
  onMembersUpdated: () => void;
}

export function ManageMembersDialog({
  children,
  squad,
  onMembersUpdated,
}: ManageMembersDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<SquadMember[]>([]);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const fetchMembers = useCallback(async () => {
    try {
      const response = await fetch(`/api/squads/${squad.id}/members`);
      if (response.ok) {
        const data = (await response.json()) as SquadMember[];
        setMembers(data);
      }
    } catch (error) {
      console.error("Failed to fetch members:", error);
    }
  }, [squad.id]);

  const fetchAvailableUsers = useCallback(async () => {
    try {
      const response = await fetch(
        "/api/admin/users?role=member&available=true",
      );
      if (response.ok) {
        const users = (await response.json()) as User[];
        setAvailableUsers(users.filter((user: User) => user.role === "member"));
      }
    } catch (error) {
      console.error("Failed to fetch available users:", error);
    }
  }, []);

  useEffect(() => {
    if (open) {
      void fetchMembers();
      void fetchAvailableUsers();
    }
  }, [open, fetchMembers, fetchAvailableUsers]);

  const handleAddMember = async () => {
    if (!selectedUserId) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/squads/${squad.id}/members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: selectedUserId }),
      });
      if (!response.ok) {
        const error = (await response.json()) as { error?: string };
        throw new Error(error.error ?? "Failed to add member");
      }

      setSelectedUserId("");
      void fetchMembers();
      void fetchAvailableUsers();
      onMembersUpdated();
    } catch (error) {
      console.error("Error adding member:", error);
      alert(error instanceof Error ? error.message : "Failed to add member");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/squads/${squad.id}/members/${userId}`,
        {
          method: "DELETE",
        },
      );
      if (!response.ok) {
        const error = (await response.json()) as { error?: string };
        throw new Error(error.error ?? "Failed to remove member");
      }

      void fetchMembers();
      void fetchAvailableUsers();
      onMembersUpdated();
    } catch (error) {
      console.error("Error removing member:", error);
      alert(error instanceof Error ? error.message : "Failed to remove member");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Manage Squad Members</DialogTitle>
          <DialogDescription>
            Add or remove members from {squad.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add New Member */}
          <div className="space-y-3">
            <Label>Add New Member</Label>
            <div className="flex gap-2">
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select a member to add" />
                </SelectTrigger>
                <SelectContent>
                  {availableUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name ?? "Unnamed User"}
                      {user.ign && ` (${user.ign})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={handleAddMember}
                disabled={!selectedUserId || loading}
              >
                Add
              </Button>
            </div>
          </div>

          {/* Current Members */}
          <div className="space-y-3">
            <Label>Current Members ({members.length})</Label>
            <Card className="p-4">
              {members.length === 0 ? (
                <div className="text-muted-foreground py-4 text-center">
                  No members in this squad yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between rounded-md border p-3"
                    >
                      <div>
                        {" "}
                        <div className="font-medium">
                          {member.userName ?? "Unnamed User"}
                        </div>
                        {member.userIgn && (
                          <div className="text-muted-foreground text-sm">
                            IGN: {member.userIgn}
                          </div>
                        )}
                        <div className="text-muted-foreground text-xs">
                          Joined:{" "}
                          {new Date(member.joinedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveMember(member.userId)}
                        disabled={loading}
                      >
                        <IconUserMinus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
