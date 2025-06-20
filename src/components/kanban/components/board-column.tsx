import type { Task } from "../utils/api-store";
import { type UniqueIdentifier } from "@dnd-kit/core";
import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cva } from "class-variance-authority";
import { IconGripVertical } from "@tabler/icons-react";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ColumnActions } from "./column-action";
import { TaskCard } from "./task-card";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface Column {
  id: UniqueIdentifier;
  title: string;
  color?: string;
}

export type ColumnType = "Column";

export interface ColumnDragData {
  type: ColumnType;
  column: Column;
}

interface BoardColumnProps {
  column: Column;
  tasks: Task[];
  isOverlay?: boolean;
}

export function BoardColumn({ column, tasks, isOverlay }: BoardColumnProps) {
  const tasksIds = useMemo(() => {
    return tasks.map((task) => task.id);
  }, [tasks]);

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: {
      type: "Column",
      column,
    } satisfies ColumnDragData,
    attributes: {
      roleDescription: `Column: ${column.title}`,
    },
  });

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  };

  const variants = cva(
    "h-[75vh] max-h-[75vh] w-[350px] max-w-full bg-secondary flex flex-col shrink-0 snap-center",
    {
      variants: {
        dragging: {
          default: "border-2 border-transparent",
          over: "ring-2 opacity-30",
          overlay: "ring-2 ring-primary",
        },
      },
    },
  );

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={variants({
        dragging: isOverlay ? "overlay" : isDragging ? "over" : undefined,
      })}
    >
      <CardHeader
        className="space-between flex flex-row items-center border-b-2 p-4 text-left font-semibold"
        style={{
          borderBottomColor: column.color ?? "#6b7280",
          backgroundColor: `${column.color ?? "#6b7280"}15`, // 15 is for low opacity
        }}
      >
        <Button
          variant={"ghost"}
          {...attributes}
          {...listeners}
          className="text-primary/50 relative -ml-2 h-auto cursor-grab p-1"
        >
          <span className="sr-only">{`Move column: ${column.title}`}</span>
          <IconGripVertical />
        </Button>
        {/* <span className="mr-auto mt-0!"> {column.title}</span> */}
        {/* <Input
          defaultValue={column.title}
          className="text-base mt-0! mr-auto"
        /> */}
        <ColumnActions
          id={column.id}
          title={column.title}
          color={column.color}
        />
      </CardHeader>
      <CardContent className="flex grow flex-col gap-4 overflow-x-hidden p-2">
        <ScrollArea className="h-full">
          <SortableContext items={tasksIds}>
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </SortableContext>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export function BoardContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full overflow-x-auto overflow-y-hidden">
      <div className="flex min-w-max flex-row items-start justify-start gap-4 px-2 pb-4">
        {children}
      </div>
    </div>
  );
}
