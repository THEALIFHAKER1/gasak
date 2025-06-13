"use client";

import { useState } from "react";
import { toast } from "sonner";
import Image from "next/image";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, Loader2, ImageIcon, FileImage, Trash2 } from "lucide-react";

interface SquadImageUploadProps {
  squadId: string;
  squadName: string;
  currentImage?: string | null;
  currentBanner?: string | null;
  onImageUpdate?: (imageUrl: string, fieldType: "image" | "banner") => void;
  onImageDelete?: (fieldType: "image" | "banner") => void;
}

export function SquadImageUpload({
  squadId,
  squadName,
  currentImage,
  currentBanner,
  onImageUpdate,
  onImageDelete,
}: SquadImageUploadProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedField, setSelectedField] = useState<"image" | "banner">(
    "image",
  );
  const handleUploadComplete = async (res: Array<{ url: string }>) => {
    try {
      const imageUrl = res[0]?.url;

      if (!imageUrl) {
        toast.error("Failed to get uploaded image URL");
        return;
      }

      // Optimistic update - update UI immediately
      onImageUpdate?.(imageUrl, selectedField);
      toast.success(`Squad ${selectedField} updated successfully`);
      setIsOpen(false);

      // Update the database in the background
      setIsUpdating(true);
      const response = await fetch("/api/squads/update-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          squadId,
          image: imageUrl,
          fieldType: selectedField,
        }),
      });
      if (!response.ok) {
        let errorMessage = "Failed to update squad image";
        try {
          const error = (await response.json()) as { error?: string };
          errorMessage = error.error ?? errorMessage;
        } catch {
          // If response is not JSON, use a generic error message
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        // Revert optimistic update on error
        const revertValue =
          selectedField === "image" ? currentImage : currentBanner;
        onImageUpdate?.(revertValue ?? "", selectedField);
        throw new Error(errorMessage);
      }

      // Success - no need to update UI again as it's already updated optimistically
    } catch (error) {
      console.error("Error updating squad image:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update squad image",
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteImage = async () => {
    const currentFieldImage =
      selectedField === "image" ? currentImage : currentBanner;
    if (!currentFieldImage) return;

    try {
      setIsDeleting(true);

      // Optimistic update - remove image immediately
      onImageDelete?.(selectedField);
      toast.success(`Squad ${selectedField} deleted successfully`);
      setIsOpen(false);

      // Delete from database and UploadThing in the background
      const response = await fetch("/api/squads/delete-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          squadId,
          fieldType: selectedField,
        }),
      });
      if (!response.ok) {
        let errorMessage = "Failed to delete squad image";
        try {
          const error = (await response.json()) as { error?: string };
          errorMessage = error.error ?? errorMessage;
        } catch {
          // If response is not JSON, use a generic error message
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        // Revert optimistic update on error
        onImageUpdate?.(currentFieldImage, selectedField);
        throw new Error(errorMessage);
      }

      // Success - no need to update UI again as it's already updated optimistically
    } catch (error) {
      console.error("Error deleting squad image:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete squad image",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const currentFieldImage =
    selectedField === "image" ? currentImage : currentBanner;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Upload className="h-4 w-4" />
          Update Images
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Squad Images</DialogTitle>
          <DialogDescription>
            Upload a new profile picture or banner for {squadName}.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Select Image Type
            </label>
            <Select
              value={selectedField}
              onValueChange={(value: "image" | "banner") =>
                setSelectedField(value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="image">
                  {" "}
                  <div className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    Profile Picture
                  </div>
                </SelectItem>
                <SelectItem value="banner">
                  <div className="flex items-center gap-2">
                    <FileImage className="h-4 w-4" />
                    Banner Image
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {currentFieldImage && (
            <div className="flex flex-col items-center space-y-2">
              <label className="text-sm font-medium">
                Current {selectedField}
              </label>{" "}
              <div
                className={`relative overflow-hidden rounded-lg border ${
                  selectedField === "banner"
                    ? "aspect-[3/1] w-full"
                    : "aspect-square w-32"
                }`}
              >
                <Image
                  src={currentFieldImage}
                  alt={`Current ${selectedField}`}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          )}
          <div className="w-full space-y-2">
            {" "}
            <JpgUploadButton
              endpoint="squadImage"
              input={{ squadId, fieldType: selectedField }}
              onClientUploadComplete={handleUploadComplete}
              onUploadError={(error: Error) => {
                console.error("Upload error:", error);
                toast.error(`Upload failed: ${error.message}`);
              }}
              quality={0.9}
              maxWidth={selectedField === "banner" ? 1920 : 800}
              maxHeight={selectedField === "banner" ? 640 : 800}
              appearance={{
                button: "w-full",
                allowedContent: "text-sm text-muted-foreground",
              }}
            />
            {currentFieldImage && (
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
                {isDeleting ? "Deleting..." : `Delete ${selectedField}`}
              </Button>
            )}
          </div>

          {isUpdating && (
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              Updating {selectedField}...
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
