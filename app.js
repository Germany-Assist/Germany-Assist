import express from "express";
import "./utils/loggers.js";
import { createServer } from "http";
import { SERVER_PORT } from "./configs/serverConfig.js";
import { sequelize } from "./database/connection.js";
import { userRouter } from "./routes/userRoutes.js";
import cors from "cors";
import morganMiddleware from "./middlewares/morgan.middleware.js";
import { debugLogger, errorLogger, infoLogger } from "./utils/loggers.js";
import { AppError } from "./utils/error.class.js";
import { errorMiddleware } from "./middlewares/errorHandler.middleware.js";

const app = express();
const server = createServer(app);
app.use(cors());
app.use(morganMiddleware);
app.use("/user", userRouter);

app.use("/", async (req, res, next) => {
  try {
    await Promise.resolve().then(() => {
      throw new AppError(404, "bad route", true);
    });
  } catch (error) {
    next(error);
  }
});

app.use(errorMiddleware);
server.listen(SERVER_PORT, async () => {
  try {
    await sequelize.authenticate();
    await import("./database/dbIndex.js");
    infoLogger(
      `\n Server is running at port ${SERVER_PORT} 👋 \n Connected to the database successfully 👍`
    );
    if (process.env.NODE_ENV === "dev" || process.env.NODE_ENV === "test")
      await sequelize.sync({ alter: true });
  } catch (error) {
    infoLogger(
      `\n "Unable to connect to the database:", ${error.message} \n server is shutting down`
    );
    errorLogger(error);
    await sequelize.close();
    server.close();
  }
});
