import { config } from "dotenv";
import postgres from "postgres";

// Load environment variables
config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is required");
}

const client = postgres(connectionString);

async function fixRoleColumn() {
  try {
    console.log("🔍 Checking current role column type...");

    // Check current column type
    const columnInfo = await client`
      SELECT column_name, data_type, udt_name 
      FROM information_schema.columns 
      WHERE table_name = 'gasak_user' AND column_name = 'role'
    `;

    console.log("Current role column info:", columnInfo);

    // Check if role enum exists
    const enumExists = await client`
      SELECT typname FROM pg_type WHERE typname = 'role'
    `;

    console.log("Role enum exists:", enumExists.length > 0);
    if (
      columnInfo.length > 0 &&
      columnInfo[0]?.data_type === "character varying"
    ) {
      console.log("🔧 Role column is currently varchar, converting to enum...");

      // First, ensure the enum exists
      if (enumExists.length === 0) {
        console.log("Creating role enum...");
        await client`CREATE TYPE role AS ENUM('admin', 'leader', 'member')`;
      }
      // Update the column type to use the enum
      console.log("Converting column to enum type...");

      // First remove the default constraint
      await client`
        ALTER TABLE gasak_user 
        ALTER COLUMN role DROP DEFAULT
      `;

      // Then convert the column type
      await client`
        ALTER TABLE gasak_user 
        ALTER COLUMN role TYPE role 
        USING role::role
      `;

      // Add back the default with proper enum value
      await client`
        ALTER TABLE gasak_user 
        ALTER COLUMN role SET DEFAULT 'member'::role
      `;

      console.log("✅ Role column successfully converted to enum type!");
    } else if (columnInfo.length > 0 && columnInfo[0]?.udt_name === "role") {
      console.log("✅ Role column is already using enum type!");
    } else {
      console.log("❓ Unexpected column configuration");
    }

    // Verify the change
    const updatedColumnInfo = await client`
      SELECT column_name, data_type, udt_name 
      FROM information_schema.columns 
      WHERE table_name = 'gasak_user' AND column_name = 'role'
    `;

    console.log("Updated role column info:", updatedColumnInfo);
  } catch (error) {
    console.error("❌ Error fixing role column:", error);
  } finally {
    await client.end();
  }
}

void fixRoleColumn();
