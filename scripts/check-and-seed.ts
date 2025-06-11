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

async function checkAndSeedAdmin() {
  try {
    // Check if the user table exists and its structure
    console.log("Checking table structure...");
    const tables = await client`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'gasak_user'
      ORDER BY ordinal_position;
    `;

    console.log("Current table structure:", tables);

    // Check if admin user already exists
    const existingAdmin = await client`
      SELECT email FROM gasak_user WHERE email = 'admin@gasak.com'
    `;

    if (existingAdmin.length > 0) {
      console.log("✅ Admin user already exists!");
      return;
    }

    // Try to create admin user with explicit ID
    const adminEmail = "admin@gasak.com";
    const adminPassword = "admin123";
    const hashedPassword = await hash(adminPassword, 12);

    // Generate a UUID for the admin user
    const adminId = crypto.randomUUID();

    await client`
      INSERT INTO gasak_user (id, name, email, password, role)
      VALUES (${adminId}, 'Administrator', ${adminEmail}, ${hashedPassword}, 'admin')
    `;

    console.log(`✅ Admin user created successfully!`);
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    console.log(`⚠️  Please change the password after first login`);
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await client.end();
  }
}

void checkAndSeedAdmin();
