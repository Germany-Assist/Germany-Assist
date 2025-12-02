import { Worker } from "bullmq";
import queueConfig from "../../configs/bullMQ.config.js";
import notificationProcessor from "../processors/notification.processor.js";

const notificationWorker = new Worker(
  "notification-events",
  notificationProcessor,
  queueConfig
);
