import { QueueEvents } from "bullmq";
import { createQueue } from "../../configs/bullMQ.config.js";
import redis from "../../configs/redis.js";
import { NODE_ENV } from "../../configs/serverConfig.js";

const stripeQueue = createQueue("stripe-events");
if (NODE_ENV != "test") {
  const queueEvents = new QueueEvents("stripe-events", { connection: redis });
  queueEvents.on("waiting", ({ jobId }) => {
    console.log(`📝 Job ${jobId} is waiting`);
  });
  queueEvents.on("active", ({ jobId, prev }) => {
    console.log(`⚡ Job ${jobId} is now active (was ${prev})`);
  });
  queueEvents.on("completed", ({ jobId, returnvalue }) => {
    console.log(`✅ Job ${jobId} completed with value:`, returnvalue);
  });
  queueEvents.on("failed", ({ jobId, failedReason }) => {
    console.error(`❌ Job ${jobId} failed:`, failedReason);
  });
  queueEvents.on("error", (error) => {
    console.error("❌ QueueEvents error:", error);
  });
}
export async function listAllJobs() {
  try {
    const jobs = await stripeQueue.getJobs([
      "waiting",
      "delayed",
      "active",
      "failed",
      "completed",
    ]);

    console.log("\n=== Queue Status ===");
    console.log(`Total jobs: ${jobs.length}`);

    jobs.forEach((job) => {
      console.log(
        `${job.id} - ${job.name} - ${job.data?.event?.id} - ${job.state}`
      );
    });

    // Get counts
    const counts = await stripeQueue.getJobCounts();
    console.log("\nJob counts:", counts);

    return jobs;
  } catch (error) {
    console.error("Error listing jobs:", error);
    return [];
  }
}

export default stripeQueue;
