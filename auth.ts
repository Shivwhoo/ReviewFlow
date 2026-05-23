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
      const db = client.db();
      const dbUser = await db
        .collection("users")
        .findOne({ email: token.email });

      let role = (dbUser?.role as "business" | "admin") || "business";
      let subscriptionTier =
        (dbUser?.subscriptionTier as "free" | "pro" | "multi-location") ||
        "free";

      if (token.email === "shivamkeshri009@gmail.com") {
        role = "admin";
        subscriptionTier = "multi-location";

        if (!dbUser || dbUser.role !== "admin" || dbUser.subscriptionTier !== "multi-location") {
          await db.collection("users").updateOne(
            { email: token.email },
            { $set: { role: "admin", subscriptionTier: "multi-location" } },
            { upsert: true }
          );
        }
      }

      token.role = role;
      token.subscriptionTier = subscriptionTier;
      token.userId = dbUser?._id?.toString() || (token.userId as string) || user?.id;

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
