import { errorLogger } from "../utils/loggers.js";

export function errorMiddleware(err, req, res, next) {
  if (err.isOperational) {
    res.status(err.httpCode).json({
      message: err.message,
    });
  } else {
    res.status(500).json({ message: "opps something went wrong" });
  }
  errorLogger(err);
}
