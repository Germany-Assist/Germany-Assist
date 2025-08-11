import morgan from "morgan";
import winston from "winston";
import { httpLogger } from "../utils/loggers.js";
import { NODE_ENV } from "../configs/serverConfig.js";
// please dont forget to edit the node env

// i created this middleware just to combine morgan with winston

const stream = {
  write: (message) => httpLogger(message),
};
// skiping is disabled
const skip = () => {
  const env = NODE_ENV || "dev";
  return env !== "dev";
};
morgan.token("requestId", (req) => req.requestId);
const morganMiddleware = morgan(
  ":method :url :status :res[content-length] - :response-time ms  [:requestId]",
  { stream }
);
export default morganMiddleware;
