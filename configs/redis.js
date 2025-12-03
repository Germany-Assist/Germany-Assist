import Redis from "ioredis";
import { errorLogger, infoLogger } from "../utils/loggers.js";
import { NODE_ENV } from "./serverConfig.js";
export const REDIS_HOST = process.env.REDIS_HOST || "127.0.0.1";
export const REDIS_PORT = process.env.REDIS_PORT || 6379;
export const REDIS_PASSWORD = process.env.REDIS_PASSWORD || undefined;

let retryCount = 0;
const fakeRedis = {
  on: () => {},
  quit: async () => {},
  disconnect: () => {},
  end: () => {},
  sendCommand: async () => null,
};
const redis =
  NODE_ENV === "test"
    ? fakeRedis
    : new Redis({
        host: REDIS_HOST,
        port: REDIS_PORT,
        password: REDIS_PASSWORD,
        maxRetriesPerRequest: null,
        retryStrategy(times) {
          retryCount = times;
          if (times > 10) {
            process.nextTick(async () => {
              infoLogger("⚠️ Redis max retries reached — shutting down");
              await import("../app.js").then(
                async (module) =>
                  await module.shutdownServer("Redis connection closed")
              );
            });
            return null;
          }
          return Math.min(times * 100, 2000);
        },
      });

redis.on("connect", () => infoLogger("✅ Redis Connected"));
redis.on("ready", () => infoLogger("👍 Redis Ready"));
redis.on("error", async (err) => errorLogger("❌ Redis error:", err));
redis.on("end", async () => {
  if (retryCount > 10) {
    infoLogger("⚠️ Redis connection closed after max retries");
    await import("../app.js").then(
      async (module) => await module.shutdownServer("Redis connection closed")
    );
  }
});
export default redis;
