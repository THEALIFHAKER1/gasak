import { config } from "dotenv";
import { hash } from "bcrypt-ts";
import postgres from "postgres";

// Load environment variables
config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is required");
}

const client = postgres(connectionString);

async function seedLeader() {
  try {
    // Check if leader user already exists
    const existingLeader = await client`
      SELECT email FROM gasak_user WHERE email = 'leader@gasak.com'
    `;

    if (existingLeader.length > 0) {
      console.log("✅ Leader user already exists!");
      return;
    }

    const leaderEmail = "leader@gasak.com";
    const leaderPassword = "leader123";
    const hashedPassword = await hash(leaderPassword, 12);

    // Generate a UUID for the leader user
    const leaderId = crypto.randomUUID();

    await client`
      INSERT INTO gasak_user (id, name, email, password, role)
      VALUES (${leaderId}, 'Team Leader', ${leaderEmail}, ${hashedPassword}, 'leader')
    `;

    console.log(`✅ Leader user created successfully!`);
    console.log(`Email: ${leaderEmail}`);
    console.log(`Password: ${leaderPassword}`);
    console.log(`Role: leader`);
  } catch (error) {
    console.error("❌ Error creating leader user:", error);
  } finally {
    await client.end();
  }
}

void seedLeader();
