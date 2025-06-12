import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, and, ne } from "drizzle-orm";
import { hash } from "bcrypt-ts";
import { z } from "zod";

// Validation schema for updating user
const updateUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  role: z.enum(["admin", "leader", "member"]),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .optional(),
});

// PUT - Update user
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as unknown;

    // Validate input
    const validationResult = updateUserSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validationResult.error.format() },
        { status: 400 },
      );
    }

    const { name, email, role, password } = validationResult.data;
    const { id: userId } = await context.params;

    // Check if user exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (existingUser.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if email is already taken by another user
    const emailConflict = await db
      .select()
      .from(users)
      .where(and(eq(users.email, email), ne(users.id, userId)))
      .limit(1);

    if (emailConflict.length > 0) {
      return NextResponse.json(
        { error: "Email is already taken by another user" },
        { status: 409 },
      );
    } // Prevent admin from demoting themselves
    if (
      userId === session.user?.id &&
      existingUser[0]?.role === "admin" &&
      role !== "admin"
    ) {
      return NextResponse.json(
        { error: "You cannot change your own admin role" },
        { status: 400 },
      );
    }

    // Prepare update data
    const updateData: {
      name: string;
      email: string;
      role: "admin" | "leader" | "member";
      password?: string;
    } = {
      name,
      email,
      role,
    };

    // Hash password if provided
    if (password) {
      updateData.password = await hash(password, 12);
    }

    // Update user
    const updatedUser = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
      });

    return NextResponse.json(updatedUser[0]);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// DELETE - Delete user
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: userId } = await context.params; // Prevent admin from deleting themselves
    if (userId === session.user?.id) {
      return NextResponse.json(
        { error: "You cannot delete your own account" },
        { status: 400 },
      );
    }

    // Check if user exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (existingUser.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Delete user
    await db.delete(users).where(eq(users.id, userId));

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
