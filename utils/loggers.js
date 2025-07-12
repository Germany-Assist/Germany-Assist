import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import { v4 as uuidv4 } from "uuid";
import { LOG_LEVEL, NODE_ENV } from "../configs/serverConfig.js";

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};
winston.loggers.add("errorLogger", {
  level: LOG_LEVEL,
  format: winston.format.combine(
    winston.format.metadata(),
    winston.format.errors({ stack: true }),
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
    winston.format.printf(({ timestamp, level, message, metadata, stack }) => {
      let logString = `${timestamp} ${level}: ${message}`;
      const { ...restMeta } = metadata;
      if (Object.keys(restMeta).length > 0) {
        logString += ` | metadata: ${JSON.stringify(restMeta)}`;
      }
      if (stack) {
        logString += `\n${stack}`;
      }
      return logString;
    })
  ),
  //     ()
  transports: [
    NODE_ENV === "dev"
      ? new winston.transports.Console()
      : new winston.transports.Console({
          format: winston.format.printf(
            ({ timestamp }) =>
              `${timestamp} error occurred please check the logs`
          ),
        }),
    new DailyRotateFile({
      filename: "./logs/errors-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "14d",
    }),
  ],
});
winston.loggers.add("httpLogger", {
  levels: levels,
  level: LOG_LEVEL,
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
    winston.format.printf(({ timestamp, level, message, LogMetaData }) => {
      return `${timestamp} ${level}: ${LogMetaData || ""} ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new DailyRotateFile({
      filename: "./logs/http-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "14d",
    }),
  ],
});
winston.loggers.add("debugLogger", {
  levels: levels,
  level: LOG_LEVEL,
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} ${level}: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new DailyRotateFile({
      level: "info",
      filename: "./logs/info-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "14d",
    }),
  ],
});

export const debugLogger = winston.loggers.get("debugLogger").debug;
export const infoLogger = winston.loggers.get("debugLogger").info;
export const httpLogger = winston.loggers.get("httpLogger").http;
export const errorLogger = winston.loggers.get("errorLogger").error;
