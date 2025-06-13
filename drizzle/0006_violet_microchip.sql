CREATE TABLE "gasak_squad_member" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"squad_id" uuid NOT NULL,
	"joinedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gasak_squad" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"leader_id" uuid,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "gasak_squad_member" ADD CONSTRAINT "gasak_squad_member_user_id_gasak_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."gasak_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gasak_squad_member" ADD CONSTRAINT "gasak_squad_member_squad_id_gasak_squad_id_fk" FOREIGN KEY ("squad_id") REFERENCES "public"."gasak_squad"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gasak_squad" ADD CONSTRAINT "gasak_squad_leader_id_gasak_user_id_fk" FOREIGN KEY ("leader_id") REFERENCES "public"."gasak_user"("id") ON DELETE set null ON UPDATE no action;