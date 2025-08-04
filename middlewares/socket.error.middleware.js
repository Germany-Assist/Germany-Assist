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
      user: socket.user.id || "invalid token no user id",
    });
  };
  socket.validationError = (message, event) => {
    let err = new AppError(422, message, false, message);
    errorLogger(err, {
      socketId: socket.id,
      user: socket.user.userId,
      event,
    });
  };
  socket.rateLimitError = (event) => {
    let err = new AppError(
      429,
      `limit reached for ${event}`,
      false,
      `limit reached for ${event}`
    );
    errorLogger(err, {
      socketId: socket.id,
      user: socket.user.userId,
    });
  };
  socket.noResultsError = (message, event) => {
    let err = new AppError(
      404,
      `${message} for ${event}`,
      false,
      `${message} for ${event}`
    );
    errorLogger(err, {
      socketId: socket.id,
      user: socket.user.userId,
    });
  };
  next();
};
