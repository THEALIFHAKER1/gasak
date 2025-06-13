import { KanbanBoardWrapper } from "@/components/kanban/components/kanban-board-wrapper";
import NewTaskDialog from "@/components/kanban/components/new-task-dialog";
import PageContainer from "@/components/layout/page-container";
import { Heading } from "@/components/ui/heading";

export default function KanbanPage() {
  return (
    <PageContainer scrollable={false}>
      <div className="h-full space-y-4">
        <div className="flex items-start justify-between">
          <Heading title={`Kanban`} description="Manage tasks by dnd" />
          <NewTaskDialog />
        </div>
        <div className="flex-1 overflow-x-auto overflow-y-hidden">
          <KanbanBoardWrapper />
        </div>
      </div>
    </PageContainer>
  );
}
