import { db } from "../src/db/index.js";
import { sql } from "drizzle-orm";

async function addIgnField() {
  try {
    console.log("Adding IGN field to users table...");

    // Add the IGN column if it doesn't exist
    await db.execute(
      sql`ALTER TABLE "gasak_user" ADD COLUMN IF NOT EXISTS "ign" text`,
    );

    console.log("✅ IGN field added successfully!");

    // Optional: Check if column was added
    const result = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'gasak_user' AND column_name = 'ign'
    `);

    if (result.length > 0) {
      console.log("✅ IGN column confirmed in database");
    } else {
      console.log("❌ IGN column not found");
    }
  } catch (error) {
    console.error("Error adding IGN field:", error);
  } finally {
    process.exit(0);
  }
}

addIgnField();
