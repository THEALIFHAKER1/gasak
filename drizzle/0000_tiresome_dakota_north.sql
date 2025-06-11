CREATE TYPE "public"."role" AS ENUM('admin', 'leader', 'member');--> statement-breakpoint
CREATE TABLE "gasak_account" (
	"userId" uuid NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"providerAccountId" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text,
	CONSTRAINT "gasak_account_provider_providerAccountId_pk" PRIMARY KEY("provider","providerAccountId")
);
--> statement-breakpoint
CREATE TABLE "gasak_session" (
	"sessionToken" text PRIMARY KEY NOT NULL,
	"userId" uuid NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gasak_user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"role" "role" DEFAULT 'member' NOT NULL,
	"emailVerified" timestamp,
	"image" text,
	CONSTRAINT "gasak_user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "gasak_verificationToken" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "gasak_verificationToken_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
ALTER TABLE "gasak_account" ADD CONSTRAINT "gasak_account_userId_gasak_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."gasak_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gasak_session" ADD CONSTRAINT "gasak_session_userId_gasak_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."gasak_user"("id") ON DELETE cascade ON UPDATE no action;