import { config } from "dotenv";
import postgres from "postgres";

// Load environment variables
config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is required");
}

const client = postgres(connectionString);

async function seedSquadData() {
  console.log("🌱 Seeding squad data...");

  try {
    // Get some existing users with different roles
    const allUsers = await client`
      SELECT id, name, email, role, ign FROM gasak_user
    `;
    console.log(`Found ${allUsers.length} users`);

    const adminUsers = allUsers.filter((user: any) => user.role === "admin");
    const leaderUsers = allUsers.filter((user: any) => user.role === "leader");
    const memberUsers = allUsers.filter((user: any) => user.role === "member");

    console.log(
      `Admin users: ${adminUsers.length}, Leader users: ${leaderUsers.length}, Member users: ${memberUsers.length}`,
    );

    // Check if squads already exist
    const existingSquads = await client`
      SELECT id, name FROM gasak_squad
    `;

    if (existingSquads.length > 0) {
      console.log(
        `✅ Found ${existingSquads.length} existing squads. Skipping seed.`,
      );
      return;
    }

    // Create test squads
    const squadData = [
      {
        name: "Alpha Squad",
        leaderId: leaderUsers[0]?.id || null,
      },
      {
        name: "Beta Squad",
        leaderId: leaderUsers[1]?.id || null,
      },
      {
        name: "Gamma Squad",
        leaderId: null, // Squad without leader
      },
    ];

    // Insert squads
    const insertedSquads = [];
    for (const squad of squadData) {
      const result = await client`
        INSERT INTO gasak_squad (name, leader_id)
        VALUES (${squad.name}, ${squad.leaderId})
        RETURNING id, name
      `;

      if (result[0]) {
        insertedSquads.push(result[0]);
        console.log(`Created squad: ${result[0].name}`);
      }
    }

    // Add some members to squads
    if (memberUsers.length > 0 && insertedSquads.length > 0) {
      // Add first 2 members to Alpha Squad
      for (let i = 0; i < Math.min(2, memberUsers.length); i++) {
        const member = memberUsers[i];
        const squad = insertedSquads[0];
        if (member && squad) {
          await client`
            INSERT INTO gasak_squad_member (user_id, squad_id)
            VALUES (${member.id}, ${squad.id})
          `;
          console.log(`Added ${member.name ?? "User"} to ${squad.name}`);
        }
      }

      // Add next 2 members to Beta Squad (if we have enough members and squads)
      if (memberUsers.length > 2 && insertedSquads.length > 1) {
        for (let i = 2; i < Math.min(4, memberUsers.length); i++) {
          const member = memberUsers[i];
          const squad = insertedSquads[1];
          if (member && squad) {
            await client`
              INSERT INTO gasak_squad_member (user_id, squad_id)
              VALUES (${member.id}, ${squad.id})
            `;
            console.log(`Added ${member.name ?? "User"} to ${squad.name}`);
          }
        }
      }
    }

    console.log("✅ Squad data seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding squad data:", error);
  } finally {
    await client.end();
  }
}

void seedSquadData();
