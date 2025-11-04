import express from "express";
import "./utils/loggers.js";
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
import { errorLogger, infoLogger } from "./utils/loggers.js";
import { AppError } from "./utils/error.class.js";
import { errorMiddleware } from "./middlewares/errorHandler.middleware.js";
import createSocketServer from "./sockets/index.js";
import apiRouter from "./routes/index.routes.js";
import { v4 as uuidv4 } from "uuid";
import paymentsRouter from "./routes/payments.routes.js";
import { DB_NAME } from "./configs/databaseConfig.js";
import redis from "./configs/redis.js";
import "./utils/bullMQ.util.js";
export const app = express();
export const server = createServer(app);
export const io = createSocketServer(server);
//TODO start with`
/*
1. validation and fixing
  A. asset validation will moved to another epic since the whole asset will be addressed then //i will delete this line after i create an issue 
  B. coupons needs to be discussed further //i will delete this line after i create an issue 
2. Extra
  A. add options for the posts routes
  B. add routes for timelines update label
  C. add routes to update the post
3. testing //phase 1 POSTMAN //phase 2 Writing tests
  A. POSTMAN : DONE
*/

//NOTE : you are on new ready branch
app
  .use((req, res, next) => {
    req.requestId = uuidv4();
    next();
  })
  .use("/payments", paymentsRouter)
  .use(cookieParser())
  .use(express.json())
  .use(
    cors({
      origin: CLIENT_URL,
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
      sequelize
        ?.close()
        .then(() => infoLogger("✅ Database connection closed")),
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
  server.listen(SERVER_PORT, "0.0.0.0", async () => {
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
