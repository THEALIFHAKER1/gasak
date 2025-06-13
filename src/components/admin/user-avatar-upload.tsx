"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { JpgUploadButton } from "@/components/ui/jpg-upload-button";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload, Loader2, Trash2 } from "lucide-react";

interface UserAvatarUploadProps {
  userId: string;
  currentImage?: string | null;
  userName?: string | null;
  onImageUpdate?: (imageUrl: string | null) => void;
  onImageDelete?: () => void;
}

export function UserAvatarUpload({
  userId,
  currentImage,
  userName,
  onImageUpdate,
  onImageDelete,
}: UserAvatarUploadProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(
    currentImage ?? null,
  );

  // Update preview when currentImage changes
  useEffect(() => {
    setPreviewImage(currentImage ?? null);
  }, [currentImage]);
  const handleUploadComplete = async (res: Array<{ url: string }>) => {
    try {
      const imageUrl = res[0]?.url;

      if (!imageUrl) {
        toast.error("Failed to get uploaded image URL");
        return;
      }

      // Optimistic update - update UI immediately
      setPreviewImage(imageUrl);
      onImageUpdate?.(imageUrl);
      toast.success("User avatar updated successfully");
      setIsOpen(false);

      // Update the database in the background
      setIsUpdating(true);
      const response = await fetch("/api/admin/users/update-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, image: imageUrl }),
      });
      if (!response.ok) {
        let errorMessage = "Failed to update user image";
        try {
          const error = (await response.json()) as { error?: string };
          errorMessage = error.error ?? errorMessage;
        } catch {
          // If response is not JSON, use a generic error message
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        // Revert optimistic update on error
        setPreviewImage(currentImage ?? null);
        onImageUpdate?.(currentImage ?? null);
        throw new Error(errorMessage);
      }

      // Success - no need to update UI again as it's already updated optimistically
    } catch (error) {
      console.error("Error updating user avatar:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update user avatar",
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteImage = async () => {
    if (!previewImage) return;

    try {
      setIsDeleting(true);

      // Optimistic update - remove image immediately
      const originalImage = previewImage;
      setPreviewImage(null);
      onImageDelete?.();
      toast.success("User avatar deleted successfully");
      setIsOpen(false);

      // Delete from database and UploadThing in the background
      const response = await fetch("/api/admin/users/delete-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });
      if (!response.ok) {
        let errorMessage = "Failed to delete user avatar";
        try {
          const error = (await response.json()) as { error?: string };
          errorMessage = error.error ?? errorMessage;
        } catch {
          // If response is not JSON, use a generic error message
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        // Revert optimistic update on error
        setPreviewImage(originalImage);
        onImageUpdate?.(originalImage);
        throw new Error(errorMessage);
      }

      // Success - no need to update UI again as it's already updated optimistically
    } catch (error) {
      console.error("Error deleting user avatar:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete user avatar",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Upload className="h-4 w-4" />
          Update Avatar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update User Avatar</DialogTitle>
          <DialogDescription>
            Upload a new profile picture for {userName ?? "this user"}.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-4">
          <Avatar className="h-20 w-20">
            <AvatarImage
              src={previewImage ?? undefined}
              alt={userName ?? "User"}
            />
            <AvatarFallback>
              {userName?.charAt(0)?.toUpperCase() ?? "U"}
            </AvatarFallback>
          </Avatar>
          <div className="w-full space-y-2">
            <JpgUploadButton
              endpoint="userAvatar"
              input={{ targetUserId: userId }}
              onClientUploadComplete={handleUploadComplete}
              onUploadError={(error: Error) => {
                console.error("Upload error:", error);
                toast.error(`Upload failed: ${error.message}`);
              }}
              quality={0.9}
              maxWidth={800}
              maxHeight={800}
              appearance={{
                button: "w-full",
                allowedContent: "text-sm text-muted-foreground",
              }}
            />
            {previewImage && (
              <Button
                variant="outline"
                onClick={handleDeleteImage}
                disabled={isDeleting || isUpdating}
                className="text-destructive hover:bg-destructive hover:text-destructive-foreground w-full gap-2"
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                {isDeleting ? "Deleting..." : "Delete Avatar"}
              </Button>
            )}
          </div>
          {isUpdating && (
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              Updating avatar...
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
