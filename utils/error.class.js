import { errorLogger } from "./loggers.js";
export class AppError extends Error {
  constructor(httpCode, message, isOperational) {
    super(message);
    this.httpCode = httpCode || false;
    this.isOperational = isOperational || false;
  }
  logError() {
    return this;
  }
}
