import QueueManager from "../../configs/bullMQ.config.js";
import notificationProcessor from "../processors/notification.processor.js";
const notificationWorker = QueueManager.createWorker(
  "notification-events",
  notificationProcessor
);
