import express from "express";
import { createServer } from "http";
import { SERVER_PORT } from "./configs/serverConfig.js";
import { sequelize } from "./database/connection.js";
import { userRouter } from "./routes/userRoutes.js";
import { serviceRouter } from "./routes/serviceRouter.js";
import { reviewRouter } from "./routes/reviewRouter.js";
import cors from "cors";

const app = express();
const server = createServer(app);
app.use(express.json());
app.use(cors());

app.use("/api/user", userRouter);
app.use("/api/service", serviceRouter);
app.use("/api/review", reviewRouter);
app.use("/", (req, res) => {
  res.sendStatus(404);
});
  
server.listen(SERVER_PORT, async () => {
  try {
    await sequelize.authenticate();
    console.log("Connected to the database successfully 👍​");
    console.log(`Server is running at port ${SERVER_PORT} 👋`);
    await import("./database/dbIndex.js");
    await sequelize.sync({ alter: true });
  } catch (error) {
    console.error("Unable to connect to the database:", error.message);
    console.error("server is shutting down");
    await sequelize.close();
    server.close();
  }
});
