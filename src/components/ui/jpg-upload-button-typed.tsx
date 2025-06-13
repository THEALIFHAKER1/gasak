"use client";

import { useState } from "react";
import { toast } from "sonner";
import { UploadButton as BaseUploadButton } from "@/lib/uploadthing";
import { convertFilesToJpg } from "@/lib/image-converter";
import { Loader2 } from "lucide-react";

// Define the input types for each endpoint
type EndpointInputMap = {
  userAvatar: { targetUserId: string };
  squadImage: { squadId: string; fieldType: "image" | "banner" };
};

// Base props that are common to all endpoints
interface BaseJpgUploadButtonProps {
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
}

// Typed props for specific endpoints
interface UserAvatarUploadProps extends BaseJpgUploadButtonProps {
  endpoint: "userAvatar";
  input: EndpointInputMap["userAvatar"];
}

interface SquadImageUploadProps extends BaseJpgUploadButtonProps {
  endpoint: "squadImage";
  input: EndpointInputMap["squadImage"];
}

// Union type for all possible props
type TypedJpgUploadButtonProps = UserAvatarUploadProps | SquadImageUploadProps;

export function TypedJpgUploadButton(props: TypedJpgUploadButtonProps) {
  const {
    endpoint,
    input,
    onClientUploadComplete,
    onUploadError,
    appearance,
    quality = 0.9,
    maxWidth,
    maxHeight,
  } = props;

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
      <BaseUploadButton
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

// Type guard functions for better type inference
export function createUserAvatarUploadProps(
  input: { targetUserId: string },
  options?: Omit<BaseJpgUploadButtonProps, "endpoint" | "input">,
): UserAvatarUploadProps {
  return {
    endpoint: "userAvatar",
    input,
    ...options,
  };
}

export function createSquadImageUploadProps(
  input: { squadId: string; fieldType: "image" | "banner" },
  options?: Omit<BaseJpgUploadButtonProps, "endpoint" | "input">,
): SquadImageUploadProps {
  return {
    endpoint: "squadImage",
    input,
    ...options,
  };
}
