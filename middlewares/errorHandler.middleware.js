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
    return res.status(err.httpCode).json({
      message: err.publicMessage,
    });
  }
  if (err instanceof UniqueConstraintError)
    return res
      .status(422)
      .json({ success: false, message: "already exists in the database" });
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

    return res.status(422).json({
      message: messages.join(", "),
      errors: messages,
    });
  }
  if (err.name === "UnauthorizedError") {
    return res.status(401).json({ message: err.message });
  }
  res.status(500).json({ message: "Oops, something went wrong" });
  errorLogger(err);
}
