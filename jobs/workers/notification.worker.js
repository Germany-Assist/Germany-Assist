import { createWorker } from "../../configs/bullMQ.config.js";
import notificationProcessor from "../processors/notification.processor.js";
const notificationWorker = createWorker(
  "notification-events",
  notificationProcessor
);
