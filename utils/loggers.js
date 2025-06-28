import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import { v4 as uuidv4 } from "uuid";
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

winston.loggers.add("errorLogger", {
  level: "error",
  format: winston.format.combine(
    winston.format.errors({ stack: true }),
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
    winston.format.printf(
      ({ timestamp, level, message, LogMetaData, stack }) => {
        return `${timestamp} ${level}: ${LogMetaData || ""} ${message} ${
          stack || ""
        }`;
      }
    )
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
        winston.format.printf(
          ({ timestamp, level, message, LogMetaData, stack }) => {
            return `${timestamp} ${level}: ${LogMetaData || ""} ${message} ${
              process.env.NODE_ENV === "dev" ? stack : "please check the logs"
            }`;
          }
        )
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
  level: "http",
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
