import Redis from "ioredis";

export const REDIS_HOST = process.env.REDIS_HOST;
export const REDIS_PORT = process.env.REDIS_PORT;

const redis = new Redis({
  host: REDIS_HOST || "127.0.0.1",
  port: REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

redis.on("error", (err) => console.error("❌ Redis error", err));
redis.on("close", () => console.warn("⚠️ Redis connection closed"));

export default redis;
