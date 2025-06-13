import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { squads } from "@/db/schema";
import { eq } from "drizzle-orm";
import { deleteUploadThingFile } from "@/lib/uploadthing-delete";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    // Only admins and leaders can delete squad images
    if (
      !session ||
      (session.user.role !== "admin" && session.user.role !== "leader")
    ) {
      return NextResponse.json(
        {
          error:
            "Unauthorized: Only admins and leaders can delete squad images",
        },
        { status: 403 },
      );
    }

    const { squadId, fieldType } = (await req.json()) as {
      squadId: string;
      fieldType: "image" | "banner";
    };

    if (!squadId || !fieldType) {
      return NextResponse.json(
        { error: "Missing required parameters: squadId and fieldType" },
        { status: 400 },
      );
    }

    if (fieldType !== "image" && fieldType !== "banner") {
      return NextResponse.json(
        { error: "Invalid fieldType. Must be 'image' or 'banner'" },
        { status: 400 },
      );
    }

    // Get the squad to validate ownership for leaders and get current images
    const squad = await db
      .select({
        id: squads.id,
        leaderId: squads.leaderId,
        image: squads.image,
        banner: squads.banner,
      })
      .from(squads)
      .where(eq(squads.id, squadId))
      .limit(1);

    if (!squad.length) {
      return NextResponse.json({ error: "Squad not found" }, { status: 404 });
    }

    const squadData = squad[0];

    // Leaders can only manage their own squad's images
    if (
      session.user.role === "leader" &&
      squadData?.leaderId !== session.user.id
    ) {
      return NextResponse.json(
        {
          error:
            "Unauthorized: Leaders can only manage their own squad's images",
        },
        { status: 403 },
      );
    }

    const currentImage =
      fieldType === "image" ? squadData?.image : squadData?.banner;

    // Update the squad to remove the image
    const updateData = { [fieldType]: null };
    await db.update(squads).set(updateData).where(eq(squads.id, squadId));

    // Delete image from UploadThing if it exists
    if (currentImage) {
      deleteUploadThingFile(currentImage).catch((error) => {
        console.error(
          `Failed to delete squad ${fieldType} from UploadThing:`,
          error,
        );
      });
    }

    return NextResponse.json({
      success: true,
      message: `Squad ${fieldType} deleted successfully`,
    });
  } catch (error) {
    console.error("Error deleting squad image:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();

    // Only admins and leaders can delete squad images
    if (
      !session ||
      (session.user.role !== "admin" && session.user.role !== "leader")
    ) {
      return NextResponse.json(
        {
          error:
            "Unauthorized: Only admins and leaders can delete squad images",
        },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(req.url);
    const squadId = searchParams.get("squadId");
    const fieldType = searchParams.get("fieldType") as
      | "image"
      | "banner"
      | null;

    if (!squadId || !fieldType) {
      return NextResponse.json(
        { error: "Missing required parameters: squadId and fieldType" },
        { status: 400 },
      );
    }

    if (fieldType !== "image" && fieldType !== "banner") {
      return NextResponse.json(
        { error: "Invalid fieldType. Must be 'image' or 'banner'" },
        { status: 400 },
      );
    }

    // Get the squad to validate ownership for leaders and get current images
    const squad = await db
      .select({
        id: squads.id,
        leaderId: squads.leaderId,
        image: squads.image,
        banner: squads.banner,
      })
      .from(squads)
      .where(eq(squads.id, squadId))
      .limit(1);

    if (!squad.length) {
      return NextResponse.json({ error: "Squad not found" }, { status: 404 });
    }

    const currentSquad = squad[0];

    // If user is a leader, check if they are the leader of this squad
    if (
      session.user.role === "leader" &&
      currentSquad?.leaderId !== session.user.id
    ) {
      return NextResponse.json(
        {
          error: "Unauthorized: Leaders can only delete their own squad images",
        },
        { status: 403 },
      );
    }

    // Get the current image URL for the field being deleted
    const currentImageUrl =
      fieldType === "image" ? currentSquad?.image : currentSquad?.banner;

    // Remove the squad image or banner from database
    const updateData =
      fieldType === "image" ? { image: null } : { banner: null };

    await db.update(squads).set(updateData).where(eq(squads.id, squadId));

    // Delete image from UploadThing if it exists
    if (currentImageUrl) {
      deleteUploadThingFile(currentImageUrl).catch((error) => {
        console.error(
          `Failed to delete squad ${fieldType} from UploadThing:`,
          error,
        );
      });
    }

    return NextResponse.json({
      success: true,
      message: `Squad ${fieldType} deleted successfully`,
    });
  } catch (error) {
    console.error("Error deleting squad image:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
