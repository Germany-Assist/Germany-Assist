import morgan from "morgan";
import winston from "winston";
import { httpLogger } from "../utils/loggers.js";
// please dont forget to edit the node env

// i created this middleware just to combine morgan with winston

const stream = {
  write: (message) => httpLogger(message),
};
const skip = () => {
  const env = process.env.NODE_ENV || "dev";
  return env !== "dev";
};
const morganMiddleware = morgan(
  ":method :url :status :res[content-length] - :response-time ms",
  { stream, skip }
);
export default morganMiddleware;
