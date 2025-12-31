import { sequelize } from "../configs/database.js";
import { disconnectRedis } from "../configs/redis.js";
import { QueueManager } from "../configs/bullMQ.config.js";
import { infoLogger, errorLogger } from "../utils/loggers.js";

let isShuttingDown = false;

export async function shutdown(event, server, io) {
  if (isShuttingDown) return;
  isShuttingDown = true;

  infoLogger(`Shutdown initiated: ${event}`);

  try {
    await Promise.allSettled([
      io &&
        new Promise((res) => {
          io.close(() => res());
        }),

      server &&
        new Promise((res, rej) =>
          server.close((err) => (err ? rej(err) : res()))
        ),

      QueueManager.shutdownAll(),
      disconnectRedis(),
      sequelize?.close(),
    ]);

    infoLogger("Shutdown complete");
  } catch (err) {
    errorLogger("Shutdown failed", err);
  }
}
