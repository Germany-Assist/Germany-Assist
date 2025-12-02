import { Queue } from "bullmq";
import queueConfig from "../../configs/bullMQ.config.js";

const notificationQueue = new Queue("notification-events", queueConfig);

export default notificationQueue;
