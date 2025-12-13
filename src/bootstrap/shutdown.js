import { sequelize } from "../configs/database.js";
import { disconnectRedis } from "../configs/redis.js";
import { QueueManager } from "../configs/bullMQ.config.js";
import { infoLogger, errorLogger } from "../utils/loggers.js";

let isShuttingDown = false;

export async function shutdown(event, server, io) {
  if (isShuttingDown) return;
  isShuttingDown = true;

  infoLogger(`🛑 Shutdown initiated: ${event}`);

  try {
    await Promise.allSettled([
      io?.close(),
      server &&
        new Promise((res, rej) =>
          server.close((err) => (err ? rej(err) : res()))
        ),
      QueueManager.shutdownAll(),
      disconnectRedis(),
      sequelize?.close(),
    ]);

    infoLogger("✅ Shutdown complete");
    process.exit(0);
  } catch (err) {
    errorLogger("❌ Shutdown failed", err);
    process.exit(1);
  }
}
