import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { sql } from "drizzle-orm";

// Load environment variables
config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is required");
}

const client = postgres(connectionString);
const db = drizzle(client);

async function addColumnColor() {
  try {
    console.log("Adding color column to kanban_column table...");

    // Add the color column if it doesn't exist
    await db.execute(sql`
      ALTER TABLE gasak_kanban_column 
      ADD COLUMN IF NOT EXISTS "color" text DEFAULT '#6b7280';
    `);

    console.log("Color column added successfully!");
  } catch (error) {
    console.error("Error adding color column:", error);
  } finally {
    await client.end();
  }
}

void addColumnColor();
