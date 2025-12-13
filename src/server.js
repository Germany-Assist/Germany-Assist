import { createServer } from "http";
import createSocketServer from "./sockets/index.js";
import { app } from "./app.js";

export const server = createServer(app);
export const io = createSocketServer(server);
