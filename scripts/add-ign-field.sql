-- Add IGN (In-Game Name) column to users table
-- This script adds the 'ign' field to store user's in-game name

ALTER TABLE "gasak_user" ADD COLUMN IF NOT EXISTS "ign" text;

-- Optional: Add some sample data or update existing users
-- UPDATE "gasak_user" SET "ign" = 'player_' || SUBSTRING("id"::text, 1, 8) WHERE "ign" IS NULL;
