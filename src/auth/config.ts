import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { type NextAuthConfig } from "next-auth";

import { db } from "@/db";
export const authConfig = {
  providers: [],
  adapter: DrizzleAdapter(db),
} satisfies NextAuthConfig;
