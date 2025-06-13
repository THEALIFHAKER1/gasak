import { UTApi } from "uploadthing/server";

const utapi = new UTApi();

/**
 * Delete a file from UploadThing by URL
 * @param fileUrl The full URL of the file to delete
 * @returns Promise<boolean> Success status
 */
export async function deleteUploadThingFile(fileUrl: string): Promise<boolean> {
  try {
    // Extract the file key from the URL
    // UploadThing URLs follow the pattern: https://utfs.io/f/{fileKey}
    const fileKey = extractFileKeyFromUrl(fileUrl);

    if (!fileKey) {
      console.error("Could not extract file key from URL:", fileUrl);
      return false;
    }

    // Delete the file using UploadThing API
    await utapi.deleteFiles([fileKey]);
    console.log("Successfully deleted file from UploadThing:", fileKey);
    return true;
  } catch (error) {
    console.error("Error deleting file from UploadThing:", error);
    return false;
  }
}

/**
 * Delete multiple files from UploadThing by URLs
 * @param fileUrls Array of file URLs to delete
 * @returns Promise<number> Number of successfully deleted files
 */
export async function deleteUploadThingFiles(
  fileUrls: string[],
): Promise<number> {
  try {
    const fileKeys = fileUrls
      .map((url) => extractFileKeyFromUrl(url))
      .filter((key): key is string => key !== null);

    if (fileKeys.length === 0) {
      console.warn("No valid file keys found in URLs:", fileUrls);
      return 0;
    }

    await utapi.deleteFiles(fileKeys);
    console.log("Successfully deleted files from UploadThing:", fileKeys);
    return fileKeys.length;
  } catch (error) {
    console.error("Error deleting files from UploadThing:", error);
    return 0;
  }
}

/**
 * Extract file key from UploadThing URL
 * @param fileUrl The full URL of the file
 * @returns string | null The file key or null if extraction failed
 */
function extractFileKeyFromUrl(fileUrl: string): string | null {
  try {
    // UploadThing URLs follow the pattern: https://utfs.io/f/{fileKey}
    const url = new URL(fileUrl);

    // Check if it's a valid UploadThing URL
    if (
      !url.hostname.includes("utfs.io") &&
      !url.hostname.includes("uploadthing")
    ) {
      console.error("Not a valid UploadThing URL:", fileUrl);
      return null;
    }

    // Extract the file key from the path
    const pathParts = url.pathname.split("/");
    const fileKey = pathParts[pathParts.length - 1];

    if (!fileKey || fileKey.length === 0) {
      console.error("Could not extract file key from path:", url.pathname);
      return null;
    }

    return fileKey;
  } catch (error) {
    console.error("Error parsing URL:", fileUrl, error);
    return null;
  }
}

/**
 * Replace an old image with a new one (delete old, keep new)
 * @param oldImageUrl The URL of the old image to delete
 * @param newImageUrl The URL of the new image (for logging)
 * @returns Promise<boolean> Success status
 */
export async function replaceUploadThingFile(
  oldImageUrl: string,
  newImageUrl: string,
): Promise<boolean> {
  try {
    console.log("Replacing UploadThing file:", {
      old: oldImageUrl,
      new: newImageUrl,
    });

    // Only delete the old file if it exists and is different from the new one
    if (oldImageUrl && oldImageUrl !== newImageUrl) {
      const success = await deleteUploadThingFile(oldImageUrl);
      if (success) {
        console.log("Successfully replaced UploadThing file");
      } else {
        console.warn("Failed to delete old file, but continuing with new file");
      }
      return success;
    }

    return true; // No old file to delete
  } catch (error) {
    console.error("Error replacing UploadThing file:", error);
    return false;
  }
}
