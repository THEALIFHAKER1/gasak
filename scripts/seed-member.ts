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

async function seedMember() {
  try {
    // Check if member user already exists
    const existingMember = await client`
      SELECT email FROM gasak_user WHERE email = 'member@gasak.com'
    `;

    if (existingMember.length > 0) {
      console.log("✅ Member user already exists!");
      return;
    }

    const memberEmail = "member@gasak.com";
    const memberPassword = "member123";
    const hashedPassword = await hash(memberPassword, 12);

    // Generate a UUID for the member user
    const memberId = crypto.randomUUID();

    await client`
      INSERT INTO gasak_user (id, name, email, password, role)
      VALUES (${memberId}, 'Team Member', ${memberEmail}, ${hashedPassword}, 'member')
    `;

    console.log(`✅ Member user created successfully!`);
    console.log(`Email: ${memberEmail}`);
    console.log(`Password: ${memberPassword}`);
    console.log(`Role: member`);
  } catch (error) {
    console.error("❌ Error creating member user:", error);
  } finally {
    await client.end();
  }
}

void seedMember();
