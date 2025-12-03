import { createQueue } from "../../configs/bullMQ.config.js";
const notificationQueue = createQueue("notification-events");
export default notificationQueue;
