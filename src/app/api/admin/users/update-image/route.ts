import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { replaceUploadThingFile } from "@/lib/uploadthing-delete";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    // Only admins can update user images
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized: Only admins can update user images" },
        { status: 403 },
      );
    }

    const body: unknown = await req.json();
    const { userId, image } = body as {
      userId: string;
      image: string;
    };

    if (!userId || !image) {
      return NextResponse.json(
        { error: "Missing required fields: userId and image" },
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

    // Update the user's image in database first
    await db.update(users).set({ image }).where(eq(users.id, userId));

    // Delete old image from UploadThing if it exists and is different
    if (currentImage && currentImage !== image) {
      // Delete old file in background (don't wait for it)
      replaceUploadThingFile(currentImage, image).catch((error) => {
        console.error(
          "Failed to delete old user image from UploadThing:",
          error,
        );
      });
    }

    return NextResponse.json({
      success: true,
      message: "User image updated successfully",
    });
  } catch (error) {
    console.error("Error updating user image:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
