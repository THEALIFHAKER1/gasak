"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import { UploadButton as BaseUploadButton } from "@/lib/uploadthing";
import { convertFilesToJpg } from "@/lib/image-converter";
import { ImageCropDialog } from "@/components/ui/image-crop-dialog";
import { Loader2 } from "lucide-react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";
import { useUploadThing } from "@/lib/uploadthing";

interface JpgUploadButtonProps {
  endpoint: keyof OurFileRouter;
  input:
    | { targetUserId: string }
    | { squadId: string; fieldType: "image" | "banner" };
  onClientUploadComplete?: (
    res: Array<{ url: string; key?: string; name?: string; size?: number }>,
  ) => void;
  onUploadError?: (error: Error) => void;
  appearance?: {
    button?: string;
    allowedContent?: string;
    container?: string;
  };
  quality?: number; // JPG quality 0.0 to 1.0
  maxWidth?: number; // Optional max width for resizing
  maxHeight?: number; // Optional max height for resizing
  enableCrop?: boolean; // Enable image cropping for profile pictures
  children?: React.ReactNode; // Custom trigger button
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
  enableCrop = true, // Default to enabled for profile pictures
  children, // Custom trigger button
}: JpgUploadButtonProps) {
  const [isConverting, setIsConverting] = useState(false);
  const [showCropDialog, setShowCropDialog] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Use the uploadthing hook for proper uploads
  const { startUpload, isUploading } = useUploadThing(endpoint, {
    onClientUploadComplete: (res) => {
      if (onClientUploadComplete) {
        onClientUploadComplete(res);
      }
    },
    onUploadError: (error) => {
      console.error("Upload error:", error);
      if (onUploadError) {
        onUploadError(error);
      }
    },
  });

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);

    try {
      setIsConverting(true);

      // For profile pictures with crop enabled, show crop dialog first
      if (
        enableCrop &&
        fileArray.length === 1 &&
        fileArray[0]?.type.startsWith("image/")
      ) {
        const file = fileArray[0];
        setOriginalFile(file);

        // Create preview URL for cropping
        const imageUrl = URL.createObjectURL(file);
        setSelectedImage(imageUrl);
        setShowCropDialog(true);
        setIsConverting(false);
        return;
      }

      // Convert all files to JPG
      const convertedFiles = await convertFilesToJpg(fileArray, {
        quality,
        maxWidth,
        maxHeight,
      });

      // Show conversion feedback
      const originalFormats = fileArray
        .map((f) => f.type)
        .filter((type) => type !== "image/jpeg");
      if (originalFormats.length > 0) {
        toast.success(
          `Converted ${originalFormats.length} image(s) to JPG format`,
        );
      }

      // Upload files manually to UploadThing
      await uploadFiles(convertedFiles);
    } catch (error) {
      console.error("Error processing files:", error);
      toast.error("Failed to process images");
      if (onUploadError) {
        onUploadError(error as Error);
      }
    } finally {
      setIsConverting(false);
    }
  };

  const uploadFiles = async (files: File[]) => {
    try {
      const result = await startUpload(files, input);
      if (result && result.length > 0) {
        if (onClientUploadComplete) {
          onClientUploadComplete(result);
        }
        toast.success("Upload completed successfully!");
      }
    } catch (error) {
      console.error("Error uploading files:", error);
      toast.error("Failed to upload files");
      if (onUploadError) {
        onUploadError(error as Error);
      }
    }
  };

  const handleCropComplete = async (croppedImageBlob: Blob) => {
    try {
      setIsConverting(true);
      setShowCropDialog(false);

      // Convert cropped blob to File
      const croppedFile = new File(
        [croppedImageBlob],
        originalFile?.name ?? "cropped-image.jpg",
        {
          type: "image/jpeg",
        },
      );

      // Convert to JPG with specified quality and dimensions
      const convertedFiles = await convertFilesToJpg([croppedFile], {
        quality,
        maxWidth,
        maxHeight,
      });

      if (convertedFiles.length > 0) {
        await uploadFiles(convertedFiles);
        toast.success("Profile picture uploaded and cropped successfully!");
      }
    } catch (error) {
      console.error("Error uploading cropped image:", error);
      toast.error("Failed to upload cropped image");
      if (onUploadError) {
        onUploadError(error as Error);
      }
    } finally {
      setIsConverting(false);
      cleanup();
    }
  };

  const handleCropCancel = () => {
    setShowCropDialog(false);
    cleanup();
  };

  const cleanup = () => {
    if (selectedImage) {
      URL.revokeObjectURL(selectedImage);
    }
    setSelectedImage("");
    setOriginalFile(null);
  };

  // Keep the original handleUploadBegin for fallback when no children
  const handleUploadBegin = async (files: File[]) => {
    try {
      setIsConverting(true);

      // For profile pictures with crop enabled, show crop dialog first
      if (
        enableCrop &&
        files.length === 1 &&
        files[0]?.type.startsWith("image/")
      ) {
        const file = files[0];
        setOriginalFile(file);

        // Create preview URL for cropping
        const imageUrl = URL.createObjectURL(file);
        setSelectedImage(imageUrl);
        setShowCropDialog(true);
        setIsConverting(false);

        // Return empty array to prevent automatic upload
        return [];
      }

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
    <>
      {/* Use custom children or fallback to UploadThing button */}
      {children ? (
        <div className="relative">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple={!enableCrop}
            className="hidden"
            onChange={(e) => {
              void handleFileSelect(e.target.files);
            }}
          />
          <div
            className={appearance?.container ?? ""}
            onClick={() => {
              fileInputRef.current?.click();
            }}
            style={{ cursor: "pointer" }}
          >
            {children}
          </div>
          {(isConverting || isUploading) && (
            <div className="bg-background/80 absolute inset-0 flex items-center justify-center rounded-md">
              <div className="text-muted-foreground flex items-center gap-2 text-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                {showCropDialog
                  ? "Preparing crop..."
                  : isUploading
                    ? "Uploading..."
                    : "Converting to JPG..."}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="relative">
          <BaseUploadButton
            endpoint={endpoint}
            input={input}
            onClientUploadComplete={onClientUploadComplete}
            onUploadError={onUploadError}
            onBeforeUploadBegin={handleUploadBegin}
            appearance={appearance}
          />

          {(isConverting || isUploading) && (
            <div className="bg-background/80 absolute inset-0 flex items-center justify-center rounded-md">
              <div className="text-muted-foreground flex items-center gap-2 text-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                {showCropDialog
                  ? "Preparing crop..."
                  : isUploading
                    ? "Uploading..."
                    : "Converting to JPG..."}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Image Crop Dialog */}
      <ImageCropDialog
        open={showCropDialog}
        onOpenChange={setShowCropDialog}
        imageSrc={selectedImage}
        onCropComplete={handleCropComplete}
        onCancel={handleCropCancel}
      />
    </>
  );
}
