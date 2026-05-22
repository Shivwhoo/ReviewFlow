import { createHash } from "crypto";

/**
 * Hash an IP address with a salt using SHA-256.
 * We never store raw IP addresses for privacy.
 */
export function hashIp(ip: string): string {
  const salt = process.env.IP_HASH_SALT || "default-dev-salt";
  return createHash("sha256")
    .update(ip + salt)
    .digest("hex");
}
