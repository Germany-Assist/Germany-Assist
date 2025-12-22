import Redis from "ioredis";
import { NODE_ENV } from "./serverConfig.js";
import { errorLogger, infoLogger } from "../utils/loggers.js";
import { shutdown } from "../bootstrap/shutdown.js";

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
  connect: async () => null,
  fake: true,
};

let redis;

if (NODE_ENV === "test") {
  redis = fakeRedis;
} else {
  redis = new Redis({
    host: REDIS_HOST,
    port: REDIS_PORT,
    password: REDIS_PASSWORD,
    lazyConnect: true,
    maxRetriesPerRequest: null,
    retryStrategy(times) {
      retryCount = times;
      if (times > 10) {
        infoLogger("⚠️ Redis max retries reached — shutting down server");
        shutdown("Redis connection closed");
        return null;
      }

      return Math.min(times * 100, 2000);
    },
  });

  redis.on("connect", () => infoLogger("✅ Redis Connected"));
  redis.on("ready", () => infoLogger("👍 Redis Ready"));
  redis.on("error", (err) => errorLogger("❌ Redis error:", err));
  redis.on("end", async () => {
    if (retryCount > 10) {
      infoLogger("⚠️ Redis connection closed after max retries");
      import("../app.js").then((module) =>
        module.shutdownServer("Redis connection closed")
      );
    }
  });
}

export async function connectRedis() {
  if (redis.status !== "ready") {
    await redis.connect();
  }
  return redis;
}

export async function disconnectRedis() {
  if (redis.status === "ready") {
    await redis.quit();
  }
}
export default redis;
