export class AppError extends Error {
  constructor(httpCode, message, isOperational, publicMessage, additional) {
    super(message);
    this.httpCode = httpCode || false;
    this.isOperational = isOperational || false;
    this.publicMessage = publicMessage || "ops somthing went wrong";
    this.additional = additional || ``;
  }
  logError() {
    return this;
  }
}
