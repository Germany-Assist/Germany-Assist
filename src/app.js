import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { v4 as uuidv4 } from "uuid";
import apiRouter from "./routes/index.routes.js";
import paymentsRouter from "./modules/payment/payments.routes.js";
import morganMiddleware from "./middlewares/morgan.middleware.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import { AppError } from "./utils/error.class.js";
import { CLIENT_URL } from "./configs/serverConfig.js";

export const app = express();

app.use((req, res, next) => {
  req.requestId = uuidv4();
  next();
});
app.use("/payments", paymentsRouter);
app.use(cookieParser());
app.use(express.json());
app.use(helmet());
app.use(
  cors({
    origin: [CLIENT_URL],
    credentials: true,
  })
);
app.use(morganMiddleware);

app.use("/api", apiRouter);

app.get("/health", (_, res) => res.sendStatus(200));

app.use(() => {
  throw new AppError(404, "bad route", true);
});

app.use(errorMiddleware);
