import { sequelize } from "../configs/database.js";
import { disconnectRedis } from "../configs/redis.js";
import { QueueManager } from "../configs/bullMQ.config.js";
import { infoLogger, errorLogger } from "../utils/loggers.js";
import { shutdownCron } from "../cron/index.js";

let isShuttingDown = false;

export async function shutdown(event, server, io) {
  if (isShuttingDown) return;
  isShuttingDown = true;

  infoLogger(`Shutdown initiated: ${event}`);

  try {
    // handle shutdown
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
      shutdownCron(),
    ]);

    infoLogger("Shutdown complete");
  } catch (err) {
    console.log(err);
    errorLogger("Shutdown failed", err);
  }
}
