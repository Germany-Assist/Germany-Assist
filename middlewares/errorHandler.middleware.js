import {
  ValidationError,
  UniqueConstraintError,
  ForeignKeyConstraintError,
} from "sequelize";
import { AppError } from "../utils/error.class.js";
import { errorLogger } from "../utils/loggers.js";

export function errorMiddleware(err, req, res, next) {
  if (err instanceof AppError) {
    err.appendTrace?.(req.requestId);
    err.trace = req.requestId;
  } else {
    err.trace = req.requestId;
  }
  if (err instanceof AppError) {
    res.status(err.httpCode).json({
      success: false,
      message: err.publicMessage,
    });
    errorLogger(err);
    return;
  }
  if (err instanceof UniqueConstraintError) {
    res
      .status(422)
      .json({ success: false, message: "already exists in the database" });
    errorLogger(err);
    return;
  }
  if (
    err instanceof ValidationError ||
    err instanceof ForeignKeyConstraintError
  ) {
    const messages = (err.errors || []).map((e) => {
      if (err instanceof ForeignKeyConstraintError) {
        return e.message || `Invalid reference for ${e.index}`;
      }
      return e.message;
    });
    res.status(422).json({
      message: messages.join(", "),
      errors: messages,
    });
    errorLogger(err);
    return;
  }
  if (err.name === "UnauthorizedError") {
    res.status(401).json({ message: err.message });
    errorLogger(err);
    return;
  }
  res.status(500).json({ message: "Oops, something went wrong" });
  errorLogger(err);
  return;
}
