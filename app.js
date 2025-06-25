import express from "express";
import { createServer } from "http";
import { SERVER_PORT } from "./configs/serverConfig.js";
import { sequelize } from "./database/connection.js";
import { userRouter } from "./routes/userRoutes.js";
import cors from "cors";

const app = express();
const server = createServer(app);

app.use(cors());
app.use("/user", userRouter);
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
