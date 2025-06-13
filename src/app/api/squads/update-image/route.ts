import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { squads } from "@/db/schema";
import { eq } from "drizzle-orm";
import { replaceUploadThingFile } from "@/lib/uploadthing-delete";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    // Only admins and leaders can update squad images
    if (
      !session ||
      (session.user.role !== "admin" && session.user.role !== "leader")
    ) {
      return NextResponse.json(
        {
          error:
            "Unauthorized: Only admins and leaders can update squad images",
        },
        { status: 403 },
      );
    }

    const body: unknown = await req.json();
    const { squadId, image, fieldType } = body as {
      squadId: string;
      image: string;
      fieldType: "image" | "banner";
    };

    if (!squadId || !image || !fieldType) {
      return NextResponse.json(
        { error: "Missing required fields: squadId, image, and fieldType" },
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
          error: "Unauthorized: Leaders can only update their own squad images",
        },
        { status: 403 },
      );
    }

    // Get the current image URL for the field being updated
    const currentImageUrl =
      fieldType === "image" ? currentSquad?.image : currentSquad?.banner;

    // Update the squad image or banner
    const updateData = fieldType === "image" ? { image } : { banner: image };

    await db.update(squads).set(updateData).where(eq(squads.id, squadId));

    // Delete old image from UploadThing if it exists and is different
    if (currentImageUrl && currentImageUrl !== image) {
      // Delete old file in background (don't wait for it)
      replaceUploadThingFile(currentImageUrl, image).catch((error) => {
        console.error(
          `Failed to delete old squad ${fieldType} from UploadThing:`,
          error,
        );
      });
    }

    return NextResponse.json({
      success: true,
      message: `Squad ${fieldType} updated successfully`,
    });
  } catch (error) {
    console.error("Error updating squad image:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
