import express from "express";
import "./utils/loggers.js";
import "./jobs/index.js";
import { createServer } from "http";
import {
  SERVER_PORT,
  CLIENT_URL,
  ENV_IS_LOADED,
  NODE_ENV,
} from "./configs/serverConfig.js";
import { sequelize } from "./database/connection.js";
import cors from "cors";
import morganMiddleware from "./middlewares/morgan.middleware.js";
import cookieParser from "cookie-parser";
import { debugLogger, errorLogger, infoLogger } from "./utils/loggers.js";
import { AppError } from "./utils/error.class.js";
import { errorMiddleware } from "./middlewares/errorHandler.middleware.js";
import createSocketServer from "./sockets/index.js";
import apiRouter from "./routes/index.routes.js";
import { v4 as uuidv4 } from "uuid";
import paymentsRouter from "./routes/payments.routes.js";
import { DB_NAME } from "./configs/databaseConfig.js";
import redis from "./configs/redis.js";
import "./configs/bullMQ.config.js";
import helmet from "helmet";
import { QueueManager } from "./configs/bullMQ.config.js";
export const app = express();
export const server = createServer(app);
export const io = createSocketServer(server);
app
  .use((req, res, next) => {
    req.requestId = uuidv4();
    next();
  })
  .use("/payments", paymentsRouter)
  .use(cookieParser())
  .use(express.json())
  .use(helmet())
  .use(
    cors({
      origin: [CLIENT_URL],
      credentials: true,
    })
  )
  .use(morganMiddleware)
  .use("/api", apiRouter);
app.get("/health", (req, res) => {
  res.sendStatus(200);
});
app
  .use("/", async (req, res, next) => {
    throw new AppError(404, "bad route", true, "Bad Route");
  })
  .use(errorMiddleware);

let isShuttingDown = false;

export const shutdownServer = async (event) => {
  if (isShuttingDown) return;
  isShuttingDown = true;
  infoLogger(`Server is shutting down due to: ${event}`);
  try {
    await Promise.allSettled([
      io.close(),
      sequelize
        ?.close()
        .then(() => infoLogger("✅ Database connection closed")),
      QueueManager.shutdownAll(),
      (async () => {
        if (redis) {
          try {
            await redis.quit();
            infoLogger("✅ Redis connection closed");
          } catch {
            infoLogger("⚠️ Redis already closed, forcing disconnect");
            redis.disconnect();
          }
        }
      })(),
      new Promise((resolve, reject) =>
        server?.close((err) =>
          err ? reject(err) : resolve(infoLogger("✅ HTTP server closed"))
        )
      ),
    ]);
    await new Promise((r) => setTimeout(r, 200));
    process.exit(0);
  } catch (error) {
    errorLogger(`❌ Shutdown error: ${error.message || error}`);
    process.exit(1);
  }
};
if (NODE_ENV !== "test") {
  server.listen(SERVER_PORT, "127.0.0.1", async () => {
    try {
      if (!ENV_IS_LOADED) throw new Error("Failed to load .env file");
      await sequelize.authenticate();
      await sequelize.sync({ alter: true });
      await import("./database/dbIndex.js");
      infoLogger(`✅ Connected to database ${DB_NAME} successfully`);
      infoLogger(`🚀 Server is running at port ${SERVER_PORT}`);
      infoLogger(`🏗️  Running in ${NODE_ENV} Mode`);
      process.on("SIGINT", () => shutdownServer("Ctrl+C Called"));
      process.on("SIGTERM", () => shutdownServer("SIGTERM"));
      process.on("uncaughtException", (err) =>
        shutdownServer(`Uncaught Exception: ${err}`)
      );
      process.on("unhandledRejection", (reason) =>
        shutdownServer(`Unhandled Rejection: ${reason}`)
      );
    } catch (error) {
      infoLogger(
        `\n ❌ Startup error: ${error.message} \n Server is shutting down...`
      );
      errorLogger(error);
      await shutdownServer("Startup failure");
    }
  });
}
