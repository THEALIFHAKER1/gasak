import { type NextRequest, NextResponse } from "next/server";

// Simple test endpoint to verify UploadThing integration
export async function GET(_req: NextRequest) {
  try {
    // Check if UploadThing token is present
    const hasUploadThingToken = !!process.env.UPLOADTHING_TOKEN;

    return NextResponse.json({
      status: "UploadThing Integration Status",
      environment: {
        UPLOADTHING_TOKEN: hasUploadThingToken ? "Set" : "Missing",
      },
      endpoints: {
        userAvatar: "/api/uploadthing (userAvatar endpoint)",
        squadImage: "/api/uploadthing (squadImage endpoint)",
      },
      apiRoutes: {
        userImageUpdate: "/api/admin/users/update-image",
        squadImageUpdate: "/api/squads/update-image",
      },
      components: {
        userAvatarUpload: "UserAvatarUpload component available",
        squadImageUpload: "SquadImageUpload component available",
      },
      demo: {
        uploadDemo: "/dashboard/upload-demo",
        adminUsers: "/dashboard/admin/users",
        adminSquads: "/dashboard/admin/squads",
      },
      ready: hasUploadThingToken,
    });
  } catch (error) {
    console.error("UploadThing integration test error:", error);
    return NextResponse.json(
      { error: "Failed to check UploadThing integration status" },
      { status: 500 },
    );
  }
}
