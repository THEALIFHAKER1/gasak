import { config } from "dotenv";
import postgres from "postgres";

// Load environment variables
config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is required");
}

const client = postgres(connectionString);

async function addIgnColumn() {
  try {
    console.log("🔍 Checking if IGN column exists...");

    // Check if ign column exists
    const columnExists = await client`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'gasak_user' AND column_name = 'ign'
    `;

    if (columnExists.length > 0) {
      console.log("✅ IGN column already exists!");
      return;
    }

    console.log("➕ Adding IGN column to gasak_user table...");

    // Add the ign column
    await client`
      ALTER TABLE gasak_user 
      ADD COLUMN ign text
    `;

    console.log("✅ IGN column added successfully!");

    // Verify the column was added
    const verification = await client`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'gasak_user' AND column_name = 'ign'
    `;

    console.log("📋 Column details:", verification);
  } catch (error) {
    console.error("❌ Error adding IGN column:", error);
  } finally {
    await client.end();
  }
}

void addIgnColumn();
