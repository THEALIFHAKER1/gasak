#!/usr/bin/env node

// UploadThing Environment Setup Script
// This script helps you set up the UploadThing environment variables

const fs = require("fs");
const path = require("path");

const UPLOADTHING_TOKEN =
  "eyJhcGlLZXkiOiJza19saXZlXzQ2MDg2M2VkODBjMjk5MjEzYzhmZWRmMGIwZjA3MGIyZjUxN2U5MDIwNzNjZDJhZDRiMDY4ODUxODViMmU3YmUiLCJhcHBJZCI6Imd5Y3VmcmJiNGUiLCJyZWdpb25zIjpbInNlYTEiXX0=";

try {
  // Decode the token
  const decoded = JSON.parse(
    Buffer.from(UPLOADTHING_TOKEN, "base64").toString(),
  );

  console.log("🚀 UploadThing Configuration");
  console.log("============================");
  console.log("App ID:", decoded.appId);
  console.log(
    "Secret Key:",
    decoded.apiKey.substring(0, 20) +
      "..." +
      decoded.apiKey.substring(decoded.apiKey.length - 10),
  );
  console.log("Regions:", decoded.regions);
  console.log("");

  // Check if .env file exists
  const envPath = path.join(process.cwd(), ".env");
  const envExamplePath = path.join(process.cwd(), ".env.example");

  let envContent = "";

  if (fs.existsSync(envPath)) {
    console.log("📝 Found existing .env file");
    envContent = fs.readFileSync(envPath, "utf8");
  } else if (fs.existsSync(envExamplePath)) {
    console.log("📝 Creating .env from .env.example");
    envContent = fs.readFileSync(envExamplePath, "utf8");
  } else {
    console.log("📝 Creating new .env file");
    envContent = `# Environment variables for GASAK
AUTH_SECRET=""
DATABASE_URL="postgresql://postgres:password@localhost:5432/gasak"
`;
  }

  // Update or add UploadThing variables
  const uploadThingSecretRegex = /UPLOADTHING_SECRET=.*/;
  const uploadThingAppIdRegex = /UPLOADTHING_APP_ID=.*/;

  if (uploadThingSecretRegex.test(envContent)) {
    envContent = envContent.replace(
      uploadThingSecretRegex,
      `UPLOADTHING_SECRET="${decoded.apiKey}"`,
    );
  } else {
    envContent += `\n# UploadThing\nUPLOADTHING_SECRET="${decoded.apiKey}"\n`;
  }

  if (uploadThingAppIdRegex.test(envContent)) {
    envContent = envContent.replace(
      uploadThingAppIdRegex,
      `UPLOADTHING_APP_ID="${decoded.appId}"`,
    );
  } else {
    envContent += `UPLOADTHING_APP_ID="${decoded.appId}"\n`;
  }

  // Write the updated .env file
  fs.writeFileSync(envPath, envContent);

  console.log("✅ Environment file updated successfully!");
  console.log("");
  console.log("Next steps:");
  console.log("1. Restart your development server if it's running");
  console.log("2. Test the integration at /api/uploadthing/status");
  console.log("3. Try the demo at /dashboard/upload-demo");
  console.log("");
  console.log("🎉 UploadThing is now configured and ready to use!");
} catch (error) {
  console.error(
    "❌ Error setting up UploadThing configuration:",
    error instanceof Error ? error.message : String(error),
  );
  console.log("");
  console.log("Manual setup required:");
  console.log("Add these to your .env file:");
  console.log(
    'UPLOADTHING_SECRET="sk_live_460863ed80c299213c8fedf0b0f070b2f517e902073cd2ad4b06885185b2e7be"',
  );
  console.log('UPLOADTHING_APP_ID="gycufrbbu4e"');
}
