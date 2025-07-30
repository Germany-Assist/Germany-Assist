import express from "express";
import "./utils/loggers.js";
import { createServer } from "http";
import { SERVER_PORT } from "./configs/serverConfig.js";
import { sequelize } from "./database/connection.js";
import { userRouter } from "./routes/userRoutes.js";
import { v4 as uuidv4 } from "uuid";
import cors from "cors";
import assteRouter from "./routes/assets.routes.js";
import couponRouter from "./routes/coupons.routes.js";
import contractRouter from "./routes/contract.routes.js";
import businessProfileRouter from "./routes/busniessProfile.routes.js";
import providerProfileRouter from "./routes/providerProfile.routes.js";
import morganMiddleware from "./middlewares/morgan.middleware.js";
import cookieParser from "cookie-parser";
import { debugLogger, errorLogger, infoLogger } from "./utils/loggers.js";
import { AppError } from "./utils/error.class.js";
import { errorMiddleware } from "./middlewares/errorHandler.middleware.js";
import { NODE_ENV } from "./configs/serverConfig.js";
import db from "./database/dbIndex.js";
import { Server } from "socket.io";
import createSocketServer from "./sockets/index.js";
import { CLIENT_URL } from "./configs/serverConfig.js";
export const app = express();
export const server = createServer(app);
const io = createSocketServer(server);

app
  .use(cookieParser())
  .use(express.json())
  .use(
    cors({
      credentials: true,
    })
  )
  .use(morganMiddleware)
  .use("/api/user", userRouter)
  .use("/api/asset", assteRouter)
  .use("/api/coupon", couponRouter)
  .use("/api/contract", contractRouter)
  .use("/api/businessProfile", businessProfileRouter)
  .use("/api/provider", providerProfileRouter);

app.get("/health", (req, res) => {
  res.sendStatus(200);
});

app
  .use("/", async (req, res, next) => {
    throw new AppError(404, "bad route", false);
  })
  .use(errorMiddleware);

if (NODE_ENV !== "test") {
  server.listen(3000, "0.0.0.0", async () => {
    try {
      await sequelize.authenticate();
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
