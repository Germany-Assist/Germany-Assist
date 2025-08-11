export class AppError extends Error {
  constructor(
    httpCode,
    message,
    isOperational,
    publicMessage,
    additional,
    trace
  ) {
    super(message);
    this.httpCode = httpCode || false;
    this.isOperational = isOperational || false;
    this.publicMessage = publicMessage || "ops somthing went wrong";
    this.additional = additional || ``;
    this.trace = trace || "";
  }
  appendTrace(trace) {
    this.trace = trace;
  }
  logError() {
    return this;
  }
}
