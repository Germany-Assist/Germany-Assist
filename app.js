import express from "express";
import "./utils/loggers.js";
import { createServer } from "http";
import { SERVER_PORT } from "./configs/serverConfig.js";
import { sequelize } from "./database/connection.js";
import { userRouter } from "./routes/userRoutes.js";
import { serviceRouter } from "./routes/serviceRouter.js";
import { reviewRouter } from "./routes/reviewRouter.js";
import cors from "cors";
import morganMiddleware from "./middlewares/morgan.middleware.js";
import { debugLogger, errorLogger, infoLogger } from "./utils/loggers.js";

const app = express();
const server = createServer(app);
app.use(express.json());
app.use(cors());
app.use(morganMiddleware);

app.use("/api/user", userRouter);
app.use("/api/service", serviceRouter);
app.use("/api/review", reviewRouter);
app.use("/", (req, res) => {
  res.sendStatus(404);
});
  
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
