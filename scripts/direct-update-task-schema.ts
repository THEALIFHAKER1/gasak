import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// Use the default database URL from .env.example
const DATABASE_URL = "postgresql://postgres:password@localhost:5432/gasak";

const client = postgres(DATABASE_URL);
const db = drizzle(client);

async function updateTaskSchema() {
  console.log("Starting task schema update...");

  try {
    // Add createdById column
    console.log("Adding createdById column...");
    await client`
      ALTER TABLE gasak_kanban_task 
      ADD COLUMN IF NOT EXISTS "createdById" text
    `;

    // Add assignedToId column
    console.log("Adding assignedToId column...");
    await client`
      ALTER TABLE gasak_kanban_task 
      ADD COLUMN IF NOT EXISTS "assignedToId" text
    `;

    // Add foreign key constraint for createdById
    console.log("Adding foreign key constraint for createdById...");
    try {
      await client`
        ALTER TABLE gasak_kanban_task 
        ADD CONSTRAINT fk_task_created_by 
        FOREIGN KEY ("createdById") 
        REFERENCES gasak_user(id) 
        ON DELETE SET NULL
      `;
    } catch (error: any) {
      if (error.message.includes("already exists")) {
        console.log(
          "Foreign key constraint for createdById already exists, skipping...",
        );
      } else {
        throw error;
      }
    }

    // Add foreign key constraint for assignedToId
    console.log("Adding foreign key constraint for assignedToId...");
    try {
      await client`
        ALTER TABLE gasak_kanban_task 
        ADD CONSTRAINT fk_task_assigned_to 
        FOREIGN KEY ("assignedToId") 
        REFERENCES gasak_user(id) 
        ON DELETE SET NULL
      `;
    } catch (error: any) {
      if (error.message.includes("already exists")) {
        console.log(
          "Foreign key constraint for assignedToId already exists, skipping...",
        );
      } else {
        throw error;
      }
    }

    console.log("Task schema update completed successfully!");

    // Verify the changes
    console.log("Verifying table structure...");
    const result = await client`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'gasak_kanban_task' 
      AND column_name IN ('createdById', 'assignedToId')
      ORDER BY column_name
    `;

    console.log("New columns:", result);
  } catch (error) {
    console.error("Error updating task schema:", error);
  } finally {
    await client.end();
  }
}

updateTaskSchema();
