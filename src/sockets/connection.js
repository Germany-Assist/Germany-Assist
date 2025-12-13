import { errorLogger, infoLogger } from "../utils/loggers.js";

export default function handleConnection(socket) {
  infoLogger(`New connection: ${socket.id}`);
  socket.on("disconnect", (reason) => {
    infoLogger(`Client disconnected: ${reason}`);
  });
  socket.on("error", (err) => {
    socket.emit("fatal_error", {
      message: "Connection problem",
      reconnect: true,
    });
  });
}
