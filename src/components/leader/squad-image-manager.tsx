"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SquadImageUpload } from "@/components/admin/squad-image-upload";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

interface LeaderSquadImageManagerProps {
  squad: {
    id: string;
    name: string;
    image?: string | null;
    banner?: string | null;
    leaderId: string | null;
  };
  onSquadUpdate?: (
    squadId: string,
    field: "image" | "banner",
    imageUrl: string,
  ) => void;
  onSquadImageDelete?: (squadId: string, field: "image" | "banner") => void;
}

export function LeaderSquadImageManager({
  squad,
  onSquadUpdate,
  onSquadImageDelete,
}: LeaderSquadImageManagerProps) {
  const { data: session } = useSession();
  const [squadImages, setSquadImages] = useState({
    image: squad.image,
    banner: squad.banner,
  });

  // Check if current user is the leader of this squad
  const isSquadLeader = session?.user?.id === squad.leaderId;
  const canManageImages = session?.user?.role === "admin" || isSquadLeader;
  const handleImageUpdate = (
    imageUrl: string,
    fieldType: "image" | "banner",
  ) => {
    // Optimistic update - update local state immediately
    setSquadImages((prev) => ({
      ...prev,
      [fieldType]: imageUrl,
    }));
    // Notify parent component for optimistic update
    onSquadUpdate?.(squad.id, fieldType, imageUrl);
  };

  const handleImageDelete = (fieldType: "image" | "banner") => {
    // Optimistic update - remove image from local state immediately
    setSquadImages((prev) => ({
      ...prev,
      [fieldType]: null,
    }));
    // Notify parent component for optimistic update
    onSquadImageDelete?.(squad.id, fieldType);
  };

  if (!canManageImages) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Squad Images</CardTitle>
          <CardDescription>
            Only squad leaders can manage their squad&apos;s images
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <InfoIcon className="h-4 w-4" />
            <AlertDescription>
              You don&apos;t have permission to manage images for this squad.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Squad Images
          <Badge variant="secondary" className="text-xs">
            {session?.user?.role === "admin" ? "Admin" : "Leader"}
          </Badge>
        </CardTitle>
        <CardDescription>
          Manage your squad&apos;s profile picture and banner image
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Images Preview */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Current Profile Picture</h4>
            {squadImages.image ? (
              <div className="relative aspect-square w-24 overflow-hidden rounded-lg border">
                <Image
                  src={squadImages.image}
                  alt={`${squad.name} profile`}
                  className="h-full w-full object-cover"
                  fill
                />
              </div>
            ) : (
              <div className="border-muted-foreground/25 text-muted-foreground flex aspect-square w-24 items-center justify-center rounded-lg border border-dashed text-xs">
                No image
              </div>
            )}
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium">Current Banner</h4>
            {squadImages.banner ? (
              <div className="relative aspect-[3/1] w-full max-w-48 overflow-hidden rounded-lg border">
                <Image
                  src={squadImages.banner}
                  alt={`${squad.name} banner`}
                  className="h-full w-full object-cover"
                  fill
                />
              </div>
            ) : (
              <div className="border-muted-foreground/25 text-muted-foreground flex aspect-[3/1] w-full max-w-48 items-center justify-center rounded-lg border border-dashed text-xs">
                No banner
              </div>
            )}
          </div>
        </div>

        {/* Upload Controls */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium">Upload New Images</h4>
              <p className="text-muted-foreground text-sm">
                Update your squad&apos;s profile picture or banner
              </p>
            </div>{" "}
            <SquadImageUpload
              squadId={squad.id}
              squadName={squad.name}
              currentImage={squadImages.image}
              currentBanner={squadImages.banner}
              onImageUpdate={handleImageUpdate}
              onImageDelete={handleImageDelete}
            />
          </div>

          {/* Role Information */}
          <Alert>
            <InfoIcon className="h-4 w-4" />
            <AlertDescription>
              {session?.user?.role === "admin"
                ? "As an admin, you can manage images for any squad."
                : "As the squad leader, you can only manage images for your own squad."}
            </AlertDescription>
          </Alert>
        </div>
      </CardContent>
    </Card>
  );
}
