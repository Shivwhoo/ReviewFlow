import { Redis } from "@upstash/redis";

/**
 * Upstash Redis client using REST API.
 * Compatible with Edge Runtime and Serverless Functions.
 */
function createRedisClient(): Redis {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    // Return a mock client for development when Redis is not configured
    console.warn(
      "⚠️ Redis credentials not found. Using mock Redis client."
    );
    return {
      get: async () => null,
      set: async () => "OK",
      del: async () => 0,
      exists: async () => 0,
      expire: async () => 0,
      incr: async () => 1,
      keys: async () => [],
      setex: async () => "OK",
    } as unknown as Redis;
  }

  return new Redis({
    url,
    token,
  });
}

const redis = createRedisClient();

export default redis;
