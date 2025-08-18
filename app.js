import express from "express";
import "./utils/loggers.js";
import { createServer } from "http";
import {
  SERVER_PORT,
  CLIENT_URL,
  ENV_IS_LOADED,
} from "./configs/serverConfig.js";
import { sequelize } from "./database/connection.js";
import cors from "cors";
import morganMiddleware from "./middlewares/morgan.middleware.js";
import cookieParser from "cookie-parser";
import { debugLogger, errorLogger, infoLogger } from "./utils/loggers.js";
import { AppError } from "./utils/error.class.js";
import { errorMiddleware } from "./middlewares/errorHandler.middleware.js";
import { NODE_ENV } from "./configs/serverConfig.js";
import db from "./database/dbIndex.js";
import { Server } from "socket.io";
import createSocketServer from "./sockets/index.js";
import apiRouter from "./routes/index.routes.js";
import { v4 as uuidv4 } from "uuid";
export const app = express();
export const server = createServer(app);
export const io = createSocketServer(server);

app;
app
  .use((req, res, next) => {
    req.requestId = uuidv4();
    next();
  })
  .use(cookieParser())
  .use(express.json())
  .use(
    cors({
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

if (NODE_ENV !== "test") {
  server.listen(3000, "0.0.0.0", async () => {
    try {
      if (!ENV_IS_LOADED) throw new Error("fail to load the env file");
      await sequelize.authenticate();
      await sequelize.sync({ alter: true });
      await import("./database/dbIndex.js");
      infoLogger(
        `\n Server is running at port ${SERVER_PORT} 👋 \n Connected to the database successfully 👍`
      );
    } catch (error) {
      infoLogger(
        `\n "Unable to connect to the database:", ${error.message} \n server is shutting down`
      );
      errorLogger(error);
      await sequelize.close();
      server.close();
    }
  });
}
