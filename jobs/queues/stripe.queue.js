import { QueueEvents } from "bullmq";
import { createQueue, listAllJobs } from "../../configs/bullMQ.config.js";
import redis from "../../configs/redis.js";
import { NODE_ENV } from "../../configs/serverConfig.js";
import { debugLogger, errorLogger } from "../../utils/loggers.js";

const stripeQueue = createQueue("stripe-events");
if (NODE_ENV != "test") {
  const queueEvents = new QueueEvents("stripe-events", { connection: redis });
  queueEvents.on("waiting", ({ jobId }) => {
    debugLogger(`📝 Job ${jobId} is waiting`);
  });
  queueEvents.on("active", ({ jobId, prev }) => {
    debugLogger(`⚡ Job ${jobId} is now active (was ${prev})`);
  });
  queueEvents.on("completed", ({ jobId, returnvalue }) => {
    debugLogger(`✅ Job ${jobId} completed with value:`, returnvalue);
  });
  queueEvents.on("failed", ({ jobId, failedReason }) => {
    errorLogger(`❌ Job ${jobId} failed:`, failedReason);
  });
  queueEvents.on("error", (error) => {
    errorLogger("❌ QueueEvents error:", error);
  });
}

await listAllJobs(stripeQueue);
export default stripeQueue;
