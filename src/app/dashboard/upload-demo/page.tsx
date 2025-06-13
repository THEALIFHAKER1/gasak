"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UserAvatarUpload } from "@/components/admin/user-avatar-upload";
import { SquadImageUpload } from "@/components/admin/squad-image-upload";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function UploadDemoPage() {
  const [userImage, setUserImage] = useState<string | null>(null);
  const [squadImage, setSquadImage] = useState<string | null>(null);
  const [squadBanner, setSquadBanner] = useState<string | null>(null);

  // Mock data for demonstration
  const mockUser = {
    id: "demo-user-id",
    name: "Demo User",
    email: "demo@example.com",
  };

  const mockSquad = {
    id: "demo-squad-id",
    name: "Demo Squad",
  };

  return (
    <div className="container mx-auto space-y-6 p-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">UploadThing Integration Demo</h1>
        <p className="text-muted-foreground">
          Demonstration of user avatar and squad image upload functionality with
          role-based restrictions
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* User Avatar Upload Demo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={userImage ?? undefined} alt={mockUser.name} />
                <AvatarFallback>
                  {mockUser.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              User Avatar Upload
              <Badge variant="secondary" className="text-xs">
                Admin Only
              </Badge>
            </CardTitle>
            <CardDescription>
              Only administrators can upload and update user profile pictures
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm">
              <p>
                <strong>User:</strong> {mockUser.name}
              </p>
              <p>
                <strong>Email:</strong> {mockUser.email}
              </p>
              <p>
                <strong>Current Image:</strong> {userImage ? "Set" : "None"}
              </p>
            </div>

            <UserAvatarUpload
              userId={mockUser.id}
              currentImage={userImage}
              userName={mockUser.name}
              onImageUpdate={(imageUrl) => {
                setUserImage(imageUrl);
                console.log("User image updated:", imageUrl);
              }}
            />

            {userImage && (
              <div className="mt-4">
                <p className="mb-2 text-sm font-medium">Preview:</p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={userImage}
                  alt="User avatar preview"
                  className="h-20 w-20 rounded-full border object-cover"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Squad Image Upload Demo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Squad Image Upload
              <Badge variant="secondary" className="text-xs">
                Admin & Leaders
              </Badge>
            </CardTitle>
            <CardDescription>
              Administrators and squad leaders can upload squad profile pictures
              and banners
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm">
              <p>
                <strong>Squad:</strong> {mockSquad.name}
              </p>
              <p>
                <strong>Profile Image:</strong> {squadImage ? "Set" : "None"}
              </p>
              <p>
                <strong>Banner Image:</strong> {squadBanner ? "Set" : "None"}
              </p>
            </div>

            <SquadImageUpload
              squadId={mockSquad.id}
              squadName={mockSquad.name}
              currentImage={squadImage}
              currentBanner={squadBanner}
              onImageUpdate={(imageUrl, fieldType) => {
                if (fieldType === "image") {
                  setSquadImage(imageUrl);
                } else {
                  setSquadBanner(imageUrl);
                }
                console.log(`Squad ${fieldType} updated:`, imageUrl);
              }}
            />

            {(squadImage ?? squadBanner) && (
              <div className="mt-4 space-y-3">
                <p className="text-sm font-medium">Preview:</p>
                {squadImage && (
                  <div>
                    <p className="text-muted-foreground mb-1 text-xs">
                      Profile Image:
                    </p>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={squadImage}
                      alt="Squad profile preview"
                      className="h-16 w-16 rounded border object-cover"
                    />
                  </div>
                )}
                {squadBanner && (
                  <div>
                    <p className="text-muted-foreground mb-1 text-xs">
                      Banner Image:
                    </p>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={squadBanner}
                      alt="Squad banner preview"
                      className="h-20 w-full rounded border object-cover"
                    />
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Features Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Implementation Features</CardTitle>
          <CardDescription>
            Key features of the UploadThing integration with role-based access
            control
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-medium">User Avatar Upload</h4>
              <ul className="text-muted-foreground space-y-1 text-sm">
                <li>• Admin-only access</li>
                <li>• 2MB file size limit</li>
                <li>• Saves to users.image column</li>
                <li>• Real-time UI updates</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Squad Image Upload</h4>
              <ul className="text-muted-foreground space-y-1 text-sm">
                <li>• Admin & Leader access</li>
                <li>• 4MB file size limit</li>
                <li>• Leaders restricted to own squad</li>
                <li>• Supports profile & banner images</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
