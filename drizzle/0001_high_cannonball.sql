CREATE TYPE "public"."status" AS ENUM('TODO', 'IN_PROGRESS', 'DONE');--> statement-breakpoint
CREATE TABLE "gasak_kanban_board" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"userId" uuid NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gasak_kanban_column" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"boardId" uuid NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gasak_kanban_task" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"status" text NOT NULL,
	"columnId" text NOT NULL,
	"boardId" uuid NOT NULL,
	"userId" uuid NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "gasak_kanban_board" ADD CONSTRAINT "gasak_kanban_board_userId_gasak_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."gasak_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gasak_kanban_column" ADD CONSTRAINT "gasak_kanban_column_boardId_gasak_kanban_board_id_fk" FOREIGN KEY ("boardId") REFERENCES "public"."gasak_kanban_board"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gasak_kanban_task" ADD CONSTRAINT "gasak_kanban_task_columnId_gasak_kanban_column_id_fk" FOREIGN KEY ("columnId") REFERENCES "public"."gasak_kanban_column"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gasak_kanban_task" ADD CONSTRAINT "gasak_kanban_task_boardId_gasak_kanban_board_id_fk" FOREIGN KEY ("boardId") REFERENCES "public"."gasak_kanban_board"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gasak_kanban_task" ADD CONSTRAINT "gasak_kanban_task_userId_gasak_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."gasak_user"("id") ON DELETE cascade ON UPDATE no action;