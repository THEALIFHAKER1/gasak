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

const users = [
  {
    email: "admin@gasak.com",
    password: "admin123",
    name: "Administrator",
    role: "admin",
  },
  {
    email: "leader@gasak.com",
    password: "leader123",
    name: "Team Leader",
    role: "leader",
  },
  {
    email: "member@gasak.com",
    password: "member123",
    name: "Team Member",
    role: "member",
  },
];

async function seedAllUsers() {
  try {
    console.log("🌱 Starting to seed all users...\n");

    for (const userData of users) {
      // Check if user already exists
      const existingUser = await client`
        SELECT email FROM gasak_user WHERE email = ${userData.email}
      `;

      if (existingUser.length > 0) {
        console.log(
          `✅ ${userData.role} user (${userData.email}) already exists!`,
        );
        continue;
      }

      const hashedPassword = await hash(userData.password, 12);
      const userId = crypto.randomUUID();

      await client`
        INSERT INTO gasak_user (id, name, email, password, role)
        VALUES (${userId}, ${userData.name}, ${userData.email}, ${hashedPassword}, ${userData.role})
      `;

      console.log(`✅ ${userData.role} user created successfully!`);
      console.log(`   Email: ${userData.email}`);
      console.log(`   Password: ${userData.password}`);
      console.log(`   Role: ${userData.role}\n`);
    }

    console.log("🎉 All users seeded successfully!");
    console.log("\n📋 Login Credentials Summary:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    users.forEach((user) => {
      console.log(
        `${user.role.toUpperCase().padEnd(8)} | ${user.email.padEnd(20)} | ${user.password}`,
      );
    });
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("⚠️  Please change all passwords after first login!");
  } catch (error) {
    console.error("❌ Error seeding users:", error);
  } finally {
    await client.end();
  }
}

void seedAllUsers();
