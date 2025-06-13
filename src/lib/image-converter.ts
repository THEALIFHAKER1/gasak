/**
 * Image conversion utilities for converting images to JPG format before upload
 */

export interface ConvertToJpgOptions {
  quality?: number; // 0.0 to 1.0, default 0.9
  maxWidth?: number; // Optional max width for resizing
  maxHeight?: number; // Optional max height for resizing
}

/**
 * Convert a File or Blob to JPG format using Canvas API
 */
export async function convertToJpg(
  file: File | Blob,
  options: ConvertToJpgOptions = {},
): Promise<File> {
  const { quality = 0.9, maxWidth, maxHeight } = options;

  return new Promise((resolve, reject) => {
    // Create image element
    const img = new Image();

    img.onload = () => {
      try {
        // Create canvas
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          reject(new Error("Failed to get canvas context"));
          return;
        }

        // Calculate dimensions
        let { width, height } = img;

        // Apply max dimensions if specified
        if (maxWidth && width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        if (maxHeight && height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }

        // Set canvas size
        canvas.width = width;
        canvas.height = height;

        // Fill with white background (JPG doesn't support transparency)
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, width, height);

        // Draw image
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Failed to convert image to blob"));
              return;
            }

            // Create new File with JPG extension
            const originalName = file instanceof File ? file.name : "image";
            const nameWithoutExt = originalName.replace(/\.[^/.]+$/, "");
            const jpgFileName = `${nameWithoutExt}.jpg`;

            const jpgFile = new File([blob], jpgFileName, {
              type: "image/jpeg",
              lastModified: Date.now(),
            });

            resolve(jpgFile);
          },
          "image/jpeg",
          quality,
        );
      } catch (error) {
        reject(
          new Error(
            error instanceof Error
              ? error.message
              : "Unknown error during conversion",
          ),
        );
      }
    };

    img.onerror = () => {
      reject(new Error("Failed to load image"));
    };

    // Load image
    const url = URL.createObjectURL(file);

    // Store the original onload handler
    const originalOnLoad = img.onload;

    img.onload = () => {
      URL.revokeObjectURL(url);
      if (originalOnLoad) {
        originalOnLoad.call(img, new Event("load"));
      }
    };

    img.src = url;
  });
}

/**
 * Check if a file needs JPG conversion
 */
export function needsJpgConversion(file: File): boolean {
  const jpgTypes = ["image/jpeg", "image/jpg"];
  return !jpgTypes.includes(file.type.toLowerCase());
}

/**
 * Convert multiple files to JPG format
 */
export async function convertFilesToJpg(
  files: File[],
  options: ConvertToJpgOptions = {},
): Promise<File[]> {
  const convertPromises = files.map(async (file) => {
    if (needsJpgConversion(file)) {
      return convertToJpg(file, options);
    }
    return file;
  });

  return Promise.all(convertPromises);
}
