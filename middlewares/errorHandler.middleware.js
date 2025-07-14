import { errorLogger } from "../utils/loggers.js";

export function errorMiddleware(err, req, res, next) {
  if (err.isOperational) {
    res.status(err.httpCode).json({
      message: err.publicMessage,
    });
  } else if (err.name === "UnauthorizedError") {
    res.sendStatus(401);
  } else {
    res.status(500).json({ message: "opps something went wrong" });
  }
  errorLogger(err);
}
