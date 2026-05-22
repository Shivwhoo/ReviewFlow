import NextAuth from "next-auth";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import client from "@/lib/db/mongodb-client";
import { authConfig } from "./auth.config";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      image?: string;
      role: "business" | "admin";
      subscriptionTier: "free" | "pro" | "multi-location";
    };
  }

  interface User {
    role?: "business" | "admin";
    subscriptionTier?: "free" | "pro" | "multi-location";
  }
}

declare module "next-auth" {
  interface JWT {
    role?: "business" | "admin";
    subscriptionTier?: "free" | "pro" | "multi-location";
    userId?: string;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: MongoDBAdapter(client),
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, trigger }) {
      if (user) {
        // First sign-in: fetch role from database in Node runtime
        const db = client.db();
        const dbUser = await db
          .collection("users")
          .findOne({ email: token.email });

        token.role = (dbUser?.role as "business" | "admin") || "business";
        token.subscriptionTier =
          (dbUser?.subscriptionTier as "free" | "pro" | "multi-location") ||
          "free";
        token.userId = dbUser?._id?.toString() || user.id;
      }

      if (trigger === "update") {
        // Re-fetch on session update in Node runtime
        const db = client.db();
        const dbUser = await db
          .collection("users")
          .findOne({ email: token.email });
        if (dbUser) {
          token.role = dbUser.role as "business" | "admin";
          token.subscriptionTier = dbUser.subscriptionTier as
            | "free"
            | "pro"
            | "multi-location";
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId as string;
        session.user.role = (token.role as "business" | "admin") || "business";
        session.user.subscriptionTier =
          (token.subscriptionTier as "free" | "pro" | "multi-location") ||
          "free";
      }
      return session;
    },
  },
});
