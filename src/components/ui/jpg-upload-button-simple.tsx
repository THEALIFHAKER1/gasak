"use client";

import { useState } from "react";
import { toast } from "sonner";
import { UploadButton } from "@/lib/uploadthing";
import { convertFilesToJpg } from "@/lib/image-converter";
import { Loader2 } from "lucide-react";

interface JpgUploadButtonProps {
  endpoint: "userAvatar" | "squadImage";
  input:
    | { targetUserId: string }
    | { squadId: string; fieldType: "image" | "banner" };
  onClientUploadComplete?: (res: Array<{ url: string }>) => void;
  onUploadError?: (error: Error) => void;
  appearance?: {
    button?: string;
    allowedContent?: string;
  };
  quality?: number; // JPG quality 0.0 to 1.0
  maxWidth?: number; // Optional max width for resizing
  maxHeight?: number; // Optional max height for resizing
}

export function JpgUploadButton({
  endpoint,
  input,
  onClientUploadComplete,
  onUploadError,
  appearance,
  quality = 0.9,
  maxWidth,
  maxHeight,
}: JpgUploadButtonProps) {
  const [isConverting, setIsConverting] = useState(false);

  const handleUploadBegin = async (files: File[]) => {
    try {
      setIsConverting(true);

      // Convert all files to JPG
      const convertedFiles = await convertFilesToJpg(files, {
        quality,
        maxWidth,
        maxHeight,
      });

      // Show conversion feedback
      const originalFormats = files
        .map((f) => f.type)
        .filter((type) => type !== "image/jpeg");
      if (originalFormats.length > 0) {
        toast.success(
          `Converted ${originalFormats.length} image(s) to JPG format`,
        );
      }

      return convertedFiles;
    } catch (error) {
      console.error("Error converting images:", error);
      toast.error("Failed to convert images to JPG format");
      throw error;
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div className="relative">
      <UploadButton
        endpoint={endpoint}
        input={input}
        onClientUploadComplete={onClientUploadComplete}
        onUploadError={onUploadError}
        onBeforeUploadBegin={handleUploadBegin}
        appearance={appearance}
      />

      {isConverting && (
        <div className="bg-background/80 absolute inset-0 flex items-center justify-center rounded-md">
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <Loader2 className="h-4 w-4 animate-spin" />
            Converting to JPG...
          </div>
        </div>
      )}
    </div>
  );
}
