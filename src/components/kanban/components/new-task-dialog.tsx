"use client";

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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useTaskStore } from "../utils/api-store";
import { useState, useEffect } from "react";

export default function NewTaskDialog() {
  const addTask = useTaskStore((state) => state.addTask);
  const loadUsers = useTaskStore((state) => state.loadUsers);
  const users = useTaskStore((state) => state.users);
  const [assignedToId, setAssignedToId] = useState<string>("unassigned");
  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    if (isOpen && users.length === 0) {
      void loadUsers();
    }
  }, [isOpen, users.length, loadUsers]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);
    const { title, description } = Object.fromEntries(formData);

    if (typeof title !== "string" || typeof description !== "string") return;
    try {
      await addTask(
        title,
        description,
        assignedToId === "unassigned" ? undefined : assignedToId,
      );
      form.reset();
      setAssignedToId("unassigned");
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to add task:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm">
          ＋ Add New Todo
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Todo</DialogTitle>
          <DialogDescription>
            What do you want to get done today?
          </DialogDescription>
        </DialogHeader>
        <form
          id="todo-form"
          className="grid gap-4 py-4"
          onSubmit={handleSubmit}
        >
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              placeholder="Todo title..."
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Description..."
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="assignedTo">Assign to (optional)</Label>
            <Select value={assignedToId} onValueChange={setAssignedToId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a user..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </form>
        <DialogFooter>
          <Button type="submit" size="sm" form="todo-form">
            Add Todo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
