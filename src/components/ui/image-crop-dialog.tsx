"use client";

import { useState, useRef, useCallback } from "react";
import ReactCrop, {
  type Crop,
  centerCrop,
  makeAspectCrop,
} from "react-image-crop";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Crop as CropIcon, Check, X } from "lucide-react";
import "react-image-crop/dist/ReactCrop.css";

interface ImageCropDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageSrc: string;
  onCropComplete: (croppedImageBlob: Blob) => void;
  onCancel: () => void;
}

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number,
) {
  const cropSize = Math.min(mediaWidth, mediaHeight) * 0.8; // Use 80% of the smaller dimension
  const cropPercent = (cropSize / Math.max(mediaWidth, mediaHeight)) * 100;

  return centerCrop(
    makeAspectCrop(
      {
        unit: "%",
        width: cropPercent,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  );
}

export function ImageCropDialog({
  open,
  onOpenChange,
  imageSrc,
  onCropComplete,
  onCancel,
}: ImageCropDialogProps) {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<Crop>();
  const imgRef = useRef<HTMLImageElement>(null);

  const onImageLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const { width, height } = e.currentTarget;
      console.log("Image loaded:", {
        width,
        height,
        naturalWidth: e.currentTarget.naturalWidth,
        naturalHeight: e.currentTarget.naturalHeight,
      });
      setCrop(centerAspectCrop(width, height, 1)); // 1:1 aspect ratio for square
    },
    [],
  );

  const getCroppedImg = useCallback(async () => {
    if (!imgRef.current || !completedCrop) return;

    const image = imgRef.current;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    // Set canvas size to the crop size
    const cropWidth = completedCrop.width * scaleX;
    const cropHeight = completedCrop.height * scaleY;

    canvas.width = cropWidth;
    canvas.height = cropHeight;

    // Draw the cropped image
    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      cropWidth,
      cropHeight,
      0,
      0,
      cropWidth,
      cropHeight,
    );

    return new Promise<Blob>((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          }
        },
        "image/jpeg",
        0.9,
      );
    });
  }, [completedCrop]);

  const handleCropConfirm = async () => {
    try {
      const croppedBlob = await getCroppedImg();
      if (croppedBlob) {
        onCropComplete(croppedBlob);
      }
    } catch (error) {
      console.error("Error cropping image:", error);
    }
  };

  const handleCancel = () => {
    onCancel();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[95vh] max-w-[90vw] overflow-hidden sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CropIcon className="h-5 w-5" />
            Crop Profile Picture
          </DialogTitle>
          <DialogDescription>
            Adjust the crop area to create a square profile picture. The
            selected area will be used as your profile image.
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-center overflow-auto rounded-lg border bg-gray-50 p-4">
          <ReactCrop
            crop={crop}
            onChange={(_, percentCrop) => setCrop(percentCrop)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={1} // Force 1:1 aspect ratio for square crop
            minWidth={50}
            minHeight={50}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              alt="Crop preview"
              src={imageSrc}
              onLoad={onImageLoad}
              style={{
                maxHeight: "60vh",
                maxWidth: "100%",
                height: "auto",
                width: "auto",
              }}
            />
          </ReactCrop>
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleCropConfirm}
            disabled={!completedCrop}
            className="flex items-center gap-2"
          >
            <Check className="h-4 w-4" />
            Apply Crop
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
