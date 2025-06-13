import { db } from "../src/db/index.ts";

async function addIgnColumn() {
  try {
    // Try to add the IGN column if it doesn't exist
    await db.execute(`
      ALTER TABLE gasak_user 
      ADD COLUMN IF NOT EXISTS ign text;
    `);

    console.log("✅ IGN column added successfully!");

    // Check if the column exists
    const result = await db.execute(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'gasak_user' AND column_name = 'ign';
    `);

    if (result.length > 0) {
      console.log("✅ IGN column confirmed to exist in database");
    } else {
      console.log("❌ IGN column not found");
    }
  } catch (error) {
    console.error("Error adding IGN column:", error);
  }

  process.exit(0);
}

addIgnColumn();
