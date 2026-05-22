import type { Session } from "next-auth";

/**
 * Check if the authenticated user is an admin.
 */
export function isAdmin(session: Session | null): boolean {
  return session?.user?.role === "admin";
}

/**
 * Check if the authenticated user is a business user.
 */
export function isBusiness(session: Session | null): boolean {
  return session?.user?.role === "business";
}

/**
 * Require an authenticated session. Throws if not authenticated.
 */
export function requireAuth(session: Session | null): asserts session is Session {
  if (!session?.user) {
    throw new Error("Authentication required");
  }
}

/**
 * Require admin role. Throws if not admin.
 */
export function requireAdmin(session: Session | null): asserts session is Session {
  requireAuth(session);
  if (!isAdmin(session)) {
    throw new Error("Admin access required");
  }
}
