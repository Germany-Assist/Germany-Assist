import express from "express";
import "./utils/loggers.js";
import { createServer } from "http";
import { SERVER_PORT } from "./configs/serverConfig.js";
import { sequelize } from "./database/connection.js";
import { userRouter } from "./routes/userRoutes.js";
import { serviceRouter } from "./routes/serviceRouter.js";
import { reviewRouter } from "./routes/reviewRouter.js";
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

export const app = express();
export const server = createServer(app);

app.use(cookieParser());

app.use(express.json());
app.use(cors());
app.use(morganMiddleware);

app.use("/api/user", userRouter);
app.use("/api/service", serviceRouter);
app.use("/api/review", reviewRouter);
app.use("/api/asset", assteRouter);
app.use("/api/coupon", couponRouter);
app.use("/api/contract", contractRouter);
app.use("/api/businessProfile", businessProfileRouter);
app.use("/api/provider", providerProfileRouter);

app.get("/health", (req, res) => {
  res.sendStatus(200);
});
app.use("/", (req, res, next) => {
  throw new AppError(404, "bad route", true);
});

app.use(errorMiddleware);

if (process.env.NODE_ENV !== "test") {
  server.listen(SERVER_PORT, async () => {
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
