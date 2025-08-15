import { ValidationError } from "sequelize";
import { AppError } from "../utils/error.class.js";
import { errorLogger } from "../utils/loggers.js";

export function errorMiddleware(err, req, res, next) {
  if (err instanceof AppError) {
    err.appendTrace(req.requestId);
  } else {
    err.trace = req.requestId;
  }
  if (err.isOperational) {
    res.status(err.httpCode).json({
      message: err.publicMessage,
    });
  } else if (err instanceof ValidationError) {
    const messages = err.errors.map((e) => e.message);
    res.status(422).json({
      message: messages.join(", "),
      errors: messages,
    });
  } else if (err.name === "UnauthorizedError") {
    res.sendStatus(401);
  } else {
    res.status(500).json({ message: "opps something went wrong" });
  }
  errorLogger(err);
}
