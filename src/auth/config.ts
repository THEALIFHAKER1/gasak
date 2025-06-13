import { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { eq } from "drizzle-orm";
import { compare } from "bcrypt-ts";

import { db } from "@/db";
import { users } from "@/db/schema";

export const authConfig = {
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await db
          .select()
          .from(users)
          .where(eq(users.email, credentials.email as string))
          .limit(1);

        if (!user.length || !user[0]?.password) {
          return null;
        }

        const foundUser = user[0];

        const isValidPassword = await compare(
          credentials.password as string,
          foundUser.password,
        );

        if (!isValidPassword) {
          return null;
        }

        return {
          id: foundUser.id,
          email: foundUser.email,
          name: foundUser.name,
          role: foundUser.role,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      // If redirecting after sign in, go to dashboard
      if (url === baseUrl || url === `${baseUrl}/`) {
        return `${baseUrl}/dashboard`;
      }
      // Allow relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allow callback URLs on the same origin
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
    async jwt({ token, user }) {
      if (user && "role" in user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub!;
        session.user.role = token.role!;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
