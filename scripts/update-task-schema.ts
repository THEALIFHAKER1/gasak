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

async function updateTaskSchema() {
  try {
    console.log(
      "Adding createdById and assignedToId columns to existing tasks...",
    );

    // Add the columns if they don't exist
    await db.execute(sql`
      ALTER TABLE gasak_kanban_task 
      ADD COLUMN IF NOT EXISTS "createdById" uuid;
    `);

    await db.execute(sql`
      ALTER TABLE gasak_kanban_task 
      ADD COLUMN IF NOT EXISTS "assignedToId" uuid;
    `);

    // Update existing tasks to set createdById to the current userId
    await db.execute(sql`
      UPDATE gasak_kanban_task 
      SET "createdById" = "userId" 
      WHERE "createdById" IS NULL;
    `);

    // Make createdById NOT NULL after populating data
    await db.execute(sql`
      ALTER TABLE gasak_kanban_task 
      ALTER COLUMN "createdById" SET NOT NULL;
    `); // Add foreign key constraints (ignore if they already exist)
    try {
      await db.execute(sql`
        ALTER TABLE gasak_kanban_task 
        ADD CONSTRAINT gasak_kanban_task_createdById_gasak_user_id_fk 
        FOREIGN KEY ("createdById") REFERENCES gasak_user("id") ON DELETE CASCADE;
      `);
      console.log("Added createdById foreign key constraint");
    } catch {
      console.log(
        "createdById foreign key constraint already exists or failed to add",
      );
    }

    try {
      await db.execute(sql`
        ALTER TABLE gasak_kanban_task 
        ADD CONSTRAINT gasak_kanban_task_assignedToId_gasak_user_id_fk 
        FOREIGN KEY ("assignedToId") REFERENCES gasak_user("id") ON DELETE SET NULL;
      `);
      console.log("Added assignedToId foreign key constraint");
    } catch {
      console.log(
        "assignedToId foreign key constraint already exists or failed to add",
      );
    }
    console.log("Schema update completed successfully!");
  } catch (error) {
    console.error("Error updating schema:", error);
  } finally {
    await client.end();
  }
}

void updateTaskSchema();
