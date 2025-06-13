import {
  createUploadthing,
  type FileRouter,
  UTFiles,
} from "uploadthing/server";
import { auth } from "@/auth";
import { z } from "zod";

const f = createUploadthing();

export const uploadRouter = {
  userAvatar: f({
    image: {
      maxFileSize: "2MB",
      maxFileCount: 1,
    },
  })
    .input(z.object({ targetUserId: z.string() }))
    .middleware(async ({ files, input }) => {
      const session = await auth();
      if (!session || session.user.role !== "admin") {
        throw new Error("Unauthorized: Only admins can upload user avatars");
      }

      // Generate custom filenames for each file using the target user ID
      const fileOverrides = files.map((file) => {
        const timestamp = Date.now();
        const newName = `user_avatar_${input.targetUserId}_${timestamp}.jpg`;
        return { ...file, name: newName };
      });

      return {
        userId: session.user.id,
        role: session.user.role,
        targetUserId: input.targetUserId,
        [UTFiles]: fileOverrides,
      };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // File upload is complete, but we don't update the database here
      // The frontend will handle the database update through a separate API call
      console.log("User avatar upload complete:", file.url);
      return { uploadedBy: metadata.userId, url: file.url };
    }),
  squadImage: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .input(
      z.object({
        squadId: z.string(),
        fieldType: z.enum(["image", "banner"]),
      }),
    )
    .middleware(async ({ files, input }) => {
      const session = await auth();
      if (
        !session ||
        (session.user.role !== "admin" && session.user.role !== "leader")
      ) {
        throw new Error(
          "Unauthorized: Only admins and leaders can upload squad images",
        );
      }

      // Generate custom filenames for each file
      const fileOverrides = files.map((file) => {
        const timestamp = Date.now();
        const newName = `squad_${input.fieldType}_${input.squadId}_${timestamp}.jpg`;
        return { ...file, name: newName };
      });

      return {
        userId: session.user.id,
        role: session.user.role,
        squadId: input.squadId,
        fieldType: input.fieldType,
        [UTFiles]: fileOverrides,
      };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // File upload is complete, but we don't update the database here
      // The frontend will handle the database update through a separate API call
      console.log("Squad image upload complete:", file.url);
      return { uploadedBy: metadata.userId, url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof uploadRouter;
