import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { Task } from "../utils/api-store";
import { useTaskStore } from "../utils/api-store";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cva } from "class-variance-authority";
import { IconGripVertical, IconTrash } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
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

// export interface Task {
//   id: UniqueIdentifier;
//   columnId: ColumnId;
//   content: string;
// }

interface TaskCardProps {
  task: Task;
  isOverlay?: boolean;
}

export type TaskType = "Task";

export interface TaskDragData {
  type: TaskType;
  task: Task;
}

export function TaskCard({ task, isOverlay }: TaskCardProps) {
  const removeTask = useTaskStore((state) => state.removeTask);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (isDeleting) return;

    setIsDeleting(true);
    try {
      await removeTask(task.id);
    } catch (error) {
      console.error("Failed to delete task:", error);
      // You could add a toast notification here instead of alert
    } finally {
      setIsDeleting(false);
    }
  };

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "Task",
      task,
    } satisfies TaskDragData,
    attributes: {
      roleDescription: "Task",
    },
  });

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  };

  const variants = cva("mb-2 group", {
    variants: {
      dragging: {
        over: "ring-2 opacity-30",
        overlay: "ring-2 ring-primary",
      },
    },
  });

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={variants({
        dragging: isOverlay ? "overlay" : isDragging ? "over" : undefined,
      })}
    >
      <CardHeader className="space-between border-secondary relative flex flex-row border-b-2 px-3 py-3">
        <Button
          variant={"ghost"}
          {...attributes}
          {...listeners}
          className="text-secondary-foreground/50 -ml-2 h-auto cursor-grab p-1"
        >
          <span className="sr-only">Move task</span>
          <IconGripVertical />
        </Button>
        <div className="ml-auto flex items-center gap-1">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-50 hover:text-red-500"
                disabled={isDeleting}
                onClick={(e) => e.stopPropagation()} // Prevent drag when clicking
              >
                <IconTrash className="h-3 w-3" />
                <span className="sr-only">Delete task</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Task</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete the task &ldquo;{task.title}
                  &rdquo;? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700"
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Badge variant={"outline"} className="font-semibold">
            Task
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="px-3 pt-3 pb-6 text-left whitespace-pre-wrap">
        <div className="space-y-2">
          <div className="font-medium">{task.title}</div>
          {task.description && (
            <div className="text-muted-foreground text-sm">
              {task.description}
            </div>
          )}
          <div className="text-muted-foreground flex flex-col gap-1 text-xs">
            {task.createdBy && (
              <div className="flex items-center gap-1">
                <span className="font-medium">Created by:</span>
                <span>{task.createdBy.name}</span>
              </div>
            )}
            {task.assignedTo && (
              <div className="flex items-center gap-1">
                <span className="font-medium">Assigned to:</span>
                <span>{task.assignedTo.name}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
