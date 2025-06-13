import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { deleteUploadThingFile } from "@/lib/uploadthing-delete";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    // Only admins can delete user images
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized: Only admins can delete user images" },
        { status: 403 },
      );
    }

    const { userId } = (await req.json()) as { userId: string };

    if (!userId) {
      return NextResponse.json(
        { error: "Missing required parameter: userId" },
        { status: 400 },
      );
    }

    // Get the current user data including existing image
    const targetUser = await db
      .select({
        id: users.id,
        image: users.image,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!targetUser.length) {
      return NextResponse.json(
        { error: "Target user not found" },
        { status: 404 },
      );
    }

    const currentImage = targetUser[0]?.image;

    // Remove the user's image from database
    await db.update(users).set({ image: null }).where(eq(users.id, userId));

    // Delete image from UploadThing if it exists
    if (currentImage) {
      deleteUploadThingFile(currentImage).catch((error) => {
        console.error("Failed to delete user image from UploadThing:", error);
      });
    }

    return NextResponse.json({
      success: true,
      message: "User avatar deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user image:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();

    // Only admins can delete user images
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized: Only admins can delete user images" },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "Missing required parameter: userId" },
        { status: 400 },
      );
    }

    // Get the current user data including existing image
    const targetUser = await db
      .select({
        id: users.id,
        image: users.image,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!targetUser.length) {
      return NextResponse.json(
        { error: "Target user not found" },
        { status: 404 },
      );
    }

    const currentImage = targetUser[0]?.image;

    // Remove the user's image from database
    await db.update(users).set({ image: null }).where(eq(users.id, userId));

    // Delete image from UploadThing if it exists
    if (currentImage) {
      deleteUploadThingFile(currentImage).catch((error) => {
        console.error("Failed to delete user image from UploadThing:", error);
      });
    }

    return NextResponse.json({
      success: true,
      message: "User avatar deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user image:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
