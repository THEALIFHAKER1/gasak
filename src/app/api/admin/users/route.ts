import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hash } from "bcrypt-ts";
import { z } from "zod";
import { randomUUID } from "crypto";

// Validation schemas
const createUserSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["admin", "leader", "member"]),
  ign: z.string().optional(),
  image: z.string().nullable().optional(),
});

// GET - List all users
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const roleFilter = searchParams.get("role") as
      | "admin"
      | "leader"
      | "member"
      | null;
    const availableFilter = searchParams.get("available");

    // Import squad tables
    const { squadMembers, squads } = await import("@/db/schema");

    let allUsers; // Get users with squad information using LEFT JOIN
    if (roleFilter && ["admin", "leader", "member"].includes(roleFilter)) {
      allUsers = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
          ign: users.ign,
          image: users.image,
          squadId: squads.id,
          squadName: squads.name,
        })
        .from(users)
        .leftJoin(squadMembers, eq(users.id, squadMembers.userId))
        .leftJoin(squads, eq(squadMembers.squadId, squads.id))
        .where(eq(users.role, roleFilter));
    } else {
      allUsers = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
          ign: users.ign,
          image: users.image,
          squadId: squads.id,
          squadName: squads.name,
        })
        .from(users)
        .leftJoin(squadMembers, eq(users.id, squadMembers.userId))
        .leftJoin(squads, eq(squadMembers.squadId, squads.id));
    }

    // If requesting available users, filter out users already in squads
    if (availableFilter === "true" && roleFilter === "member") {
      allUsers = allUsers.filter((user) => !user.squadId);
    }

    return NextResponse.json(allUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST - Create new user
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as unknown;

    // Validate input
    const validationResult = createUserSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validationResult.error.format() },
        { status: 400 },
      );
    }

    const { id, name, email, password, role, ign, image } =
      validationResult.data;

    // Check if user with email already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 },
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 12); // Create user
    const userId = id ?? randomUUID();
    const newUser = await db
      .insert(users)
      .values({
        id: userId,
        name,
        email,
        password: hashedPassword,
        role,
        ign,
        image,
      })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        ign: users.ign,
        image: users.image,
      });

    return NextResponse.json(newUser[0], { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
