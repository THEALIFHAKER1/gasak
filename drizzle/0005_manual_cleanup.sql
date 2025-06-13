-- Drop the unused table first
DROP TABLE IF EXISTS "gasak_account" CASCADE;

-- Drop and recreate enums to avoid conflicts in future migrations
DROP TYPE IF EXISTS "public"."role" CASCADE;
DROP TYPE IF EXISTS "public"."status" CASCADE;

-- Recreate the enums
CREATE TYPE "public"."role" AS ENUM('admin', 'leader', 'member');
CREATE TYPE "public"."status" AS ENUM('TODO', 'IN_PROGRESS', 'DONE');

-- Update any columns that use these enums to ensure they still work
-- (This is important because dropping CASCADE might affect existing columns)
