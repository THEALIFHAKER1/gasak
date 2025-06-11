import { config } from "dotenv";
import { hash } from "bcrypt-ts";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { users } from "../src/db/schema";

// Load environment variables
config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is required");
}

const client = postgres(connectionString);
const db = drizzle(client);

async function seedAdmin() {
  try {
    const adminEmail = "admin@gasak.com";
    const adminPassword = "admin123"; // Change this in production

    const hashedPassword = await hash(adminPassword, 12);

    await db.insert(users).values({
      name: "Administrator",
      email: adminEmail,
      password: hashedPassword,
      role: "admin",
    });

    console.log(`✅ Admin user created successfully!`);
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    console.log(`⚠️  Please change the password after first login`);
  } catch (error) {
    console.error("❌ Error creating admin user:", error);
  } finally {
    await client.end();
  }
}

void seedAdmin();
