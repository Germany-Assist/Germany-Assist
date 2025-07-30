import { AppError } from "../utils/error.class.js";
import { errorLogger } from "../utils/loggers.js";

export const socketErrorMiddleware = (socket, next) => {
  socket.error = (error) => {
    socket.emit("error", {
      status: error.httpCode || 500,
      message: error.publicMessage,
    });
    errorLogger(error, {
      socketId: socket.id,
      user: socket.user.userId,
      error,
    });
  };
  socket.validationError = (error) => {
    socket.emit("error", {
      status: 422,
      message: error.message,
    });
    errorLogger(error, {
      socketId: socket.id,
      user: socket.user.userId,
      error,
    });
  };
  socket.rateLimitError = (error) => {
    socket.emit("error", {
      status: 429,
      message: `limit reached for ${error}`,
    });
    errorLogger(`limit reached for ${error}`, {
      socketId: socket.id,
      user: socket.user.userId,
      error,
    });
  };
  next();
};
