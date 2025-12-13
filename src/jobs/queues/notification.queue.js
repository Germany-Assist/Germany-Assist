import QueueManager from "../../configs/bullMQ.config.js";
const notificationQueue = QueueManager.createQueue("notification-events").queue;
export default notificationQueue;
