import { config } from "dotenv";
import postgres from "postgres";

// Load environment variables
config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is required");
}

const client = postgres(connectionString);

async function verifyUsers() {
  try {
    console.log("🔍 Verifying existing users after enum conversion...");

    const users = await client`
      SELECT id, name, email, role 
      FROM gasak_user 
      ORDER BY role, email
    `;
    console.log("\n📋 Current Users in Database:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    users.forEach((user, index) => {
      const role = String(user.role).toUpperCase().padEnd(8);
      const email = String(user.email).padEnd(25);
      const name = String(user.name);
      console.log(`${index + 1}. ${role} | ${email} | ${name}`);
    });
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`✅ Total users: ${users.length}`);

    // Verify enum constraint works
    console.log("\n🧪 Testing enum constraint...");
    try {
      await client`
        INSERT INTO gasak_user (id, name, email, password, role)
        VALUES ('test-id', 'Test User', 'test@test.com', 'password', 'invalid_role')
      `;
      console.log(
        "❌ ERROR: Invalid role was accepted (this shouldn't happen!)",
      );
    } catch {
      console.log(
        "✅ Enum constraint working: Invalid role rejected as expected",
      );
    }
  } catch (error) {
    console.error("❌ Error verifying users:", error);
  } finally {
    await client.end();
  }
}

void verifyUsers();
