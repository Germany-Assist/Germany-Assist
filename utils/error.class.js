import { errorLogger } from "./loggers.js";
export class AppError extends Error {
  constructor(httpCode, message, isOperational, publicMessage) {
    super(message);
    this.httpCode = httpCode || false;
    this.isOperational = isOperational || false;
    this.publicMessage = publicMessage || "ops somthing went wrong";
  }
  logError() {
    return this;
  }
}
