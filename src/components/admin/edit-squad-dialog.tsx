"use client";

import { useState, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Squad, UpdateSquadData } from "@/types";

interface User {
  id: string;
  name: string | null;
  ign: string | null;
  role: string;
}

interface EditSquadDialogProps {
  children: React.ReactNode;
  squad: Squad;
  onSquadUpdated: () => void;
}

export function EditSquadDialog({
  children,
  squad,
  onSquadUpdated,
}: EditSquadDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [leaders, setLeaders] = useState<User[]>([]);
  const [formData, setFormData] = useState<UpdateSquadData>({
    name: squad.name,
    leaderId: squad.leaderId ?? "no-leader",
  });
  const fetchLeaders = async () => {
    try {
      const response = await fetch("/api/admin/users?role=leader");
      if (response.ok) {
        const users = (await response.json()) as User[];
        setLeaders(users.filter((user: User) => user.role === "leader"));
      }
    } catch (error) {
      console.error("Failed to fetch leaders:", error);
    }
  };

  useEffect(() => {
    if (open) {
      void fetchLeaders();
      setFormData({
        name: squad.name,
        leaderId: squad.leaderId ?? "no-leader",
      });
    }
  }, [open, squad]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/squads/${squad.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          leaderId:
            formData.leaderId === "no-leader" ? null : formData.leaderId,
        }),
      });
      if (!response.ok) {
        const error = (await response.json()) as { error?: string };
        throw new Error(error.error ?? "Failed to update squad");
      }

      setOpen(false);
      onSquadUpdated();
    } catch (error) {
      console.error("Error updating squad:", error);
      alert(error instanceof Error ? error.message : "Failed to update squad");
    } finally {
      setLoading(false);
    }
  };
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setFormData({
        name: squad.name,
        leaderId: squad.leaderId ?? "no-leader",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Squad</DialogTitle>
          <DialogDescription>
            Update squad name and assign or change the squad leader.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Squad Name</Label>
            <Input
              id="name"
              placeholder="Enter squad name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="leader">Squad Leader</Label>
            <Select
              value={formData.leaderId}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, leaderId: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a leader" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no-leader">No Leader</SelectItem>
                {leaders.map((leader) => (
                  <SelectItem key={leader.id} value={leader.id}>
                    {leader.name ?? "Unnamed User"}
                    {leader.ign && ` (${leader.ign})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !formData.name?.trim()}>
              {loading ? "Updating..." : "Update Squad"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
