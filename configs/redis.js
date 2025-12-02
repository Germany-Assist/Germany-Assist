import Redis from "ioredis";
import { errorLogger, infoLogger } from "../utils/loggers.js";
import { NODE_ENV } from "./serverConfig.js";
import stripeQueue from "./bullMQ.config.js";
export const REDIS_HOST = process.env.REDIS_HOST || "127.0.0.1";
export const REDIS_PORT = process.env.REDIS_PORT || 6379;
export const REDIS_PASSWORD = process.env.REDIS_PASSWORD || undefined;

let retryCount = 0;
export const redisConfig = {
  host: REDIS_HOST,
  port: REDIS_PORT,
  password: REDIS_PASSWORD,
  lazyConnect: true,
  maxRetriesPerRequest: null,
  retryStrategy(times) {
    retryCount = times;
    if (times > 10) return null;
    return Math.min(times * 100, 2000);
  },
};

const redis = new Redis(redisConfig);
redis.on("connect", () => infoLogger("✅ Redis Connected"));
redis.on("ready", () => infoLogger("👍 Redis Ready"));
redis.on("error", (err) => errorLogger("❌ Redis error:", err));
redis.on("end", async () => {
  if (retryCount > 10) {
    infoLogger("⚠️ Redis connection closed after max retries");
    await import("../app.js").then(
      async (module) => await module.shutdownServer("Redis connection closed")
    );
  }
});
export default redis;
