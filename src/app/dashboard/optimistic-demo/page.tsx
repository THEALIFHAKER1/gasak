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
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export default function OptimisticUpdateDemoPage() {
  const [userImage, setUserImage] = useState<string | null>(null);
  const [squadImage, setSquadImage] = useState<string | null>(null);
  const [squadBanner, setSquadBanner] = useState<string | null>(null);
  const [updateCount, setUpdateCount] = useState(0);

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

  const resetDemo = () => {
    setUserImage(null);
    setSquadImage(null);
    setSquadBanner(null);
    setUpdateCount(0);
  };

  return (
    <div className="container mx-auto space-y-6 p-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Optimistic Updates Demo</h1>
        <p className="text-muted-foreground">
          See how images update instantly using optimistic update techniques
        </p>
        <Badge variant="outline" className="text-xs">
          Updates: {updateCount}
        </Badge>
      </div>

      <div className="flex justify-center">
        <Button
          onClick={resetDemo}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Reset Demo
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* User Avatar Demo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Avatar key={userImage ?? mockUser.id} className="h-8 w-8">
                <AvatarImage src={userImage ?? undefined} alt={mockUser.name} />
                <AvatarFallback>
                  {mockUser.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              Optimistic User Avatar
              <Badge variant="secondary" className="text-xs">
                Admin Only
              </Badge>
            </CardTitle>
            <CardDescription>
              Watch the avatar update instantly when you upload a new image
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm">
              <p>
                <strong>User:</strong> {mockUser.name}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                {userImage ? "Custom Image Set" : "Default Avatar"}
              </p>
            </div>

            <UserAvatarUpload
              userId={mockUser.id}
              currentImage={userImage}
              userName={mockUser.name}
              onImageUpdate={(imageUrl) => {
                setUserImage(imageUrl);
                setUpdateCount((prev) => prev + 1);
                console.log("🚀 Optimistic update - User image:", imageUrl);
              }}
            />

            <div className="bg-muted/50 rounded p-3 text-sm">
              <strong>Optimistic Update Flow:</strong>
              <ol className="mt-2 list-inside list-decimal space-y-1">
                <li>File uploads to UploadThing</li>
                <li>UI updates immediately (optimistic)</li>
                <li>Database update happens in background</li>
                <li>On error, UI reverts to previous state</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        {/* Squad Images Demo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Optimistic Squad Images
              <Badge variant="secondary" className="text-xs">
                Admin & Leaders
              </Badge>
            </CardTitle>
            <CardDescription>
              Upload squad profile or banner - see instant updates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm">
              <p>
                <strong>Squad:</strong> {mockSquad.name}
              </p>
              <p>
                <strong>Profile:</strong> {squadImage ? "Custom" : "None"}
              </p>
              <p>
                <strong>Banner:</strong> {squadBanner ? "Custom" : "None"}
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
                setUpdateCount((prev) => prev + 1);
                console.log(
                  `🚀 Optimistic update - Squad ${fieldType}:`,
                  imageUrl,
                );
              }}
            />

            <div className="space-y-2">
              {squadImage && (
                <div>
                  <p className="mb-1 text-xs font-medium">Current Profile:</p>
                  <div className="h-16 w-16 overflow-hidden rounded border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      key={squadImage}
                      src={squadImage}
                      alt="Squad profile"
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
              )}
              {squadBanner && (
                <div>
                  <p className="mb-1 text-xs font-medium">Current Banner:</p>
                  <div className="h-16 w-full overflow-hidden rounded border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      key={squadBanner}
                      src={squadBanner}
                      alt="Squad banner"
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Benefits */}
      <Card>
        <CardHeader>
          <CardTitle>Optimistic Updates Benefits</CardTitle>
          <CardDescription>
            Why optimistic updates provide better user experience
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <h4 className="font-medium text-green-600">
                ✨ Instant Feedback
              </h4>
              <p className="text-muted-foreground text-sm">
                UI updates immediately without waiting for server response
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-blue-600">
                🚀 Better Performance
              </h4>
              <p className="text-muted-foreground text-sm">
                No loading states or delays - smooth user experience
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-purple-600">🔄 Error Recovery</h4>
              <p className="text-muted-foreground text-sm">
                Automatically reverts changes if server request fails
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
