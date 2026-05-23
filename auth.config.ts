import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

export const authConfig = {
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/signin",
  },
  callbacks: {
    // Edge-compatible jwt & session handlers
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role || "business";
        token.subscriptionTier = user.subscriptionTier || "free";
        token.userId = user.id;
      }
      if (token.email === "shivamkeshri009@gmail.com") {
        token.role = "admin";
        token.subscriptionTier = "multi-location";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.userId as string;
        session.user.role = (token.role as any) || "business";
        session.user.subscriptionTier = (token.subscriptionTier as any) || "free";
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
