import { createQueue, listAllJobs } from "../../configs/bullMQ.config.js";
const notificationQueue = createQueue("notification-events");
await listAllJobs(notificationQueue);
export default notificationQueue;
