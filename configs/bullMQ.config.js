import redis, { REDIS_HOST, REDIS_PASSWORD, REDIS_PORT } from "./redis.js";
import { Queue, Worker } from "bullmq";
import { NODE_ENV } from "./serverConfig.js";
import { errorLogger, infoLogger } from "../utils/loggers.js";

const isTest = NODE_ENV === "test";

export const defaultQueueOptions = {
  connection: redis,
  defaultJobOptions: {
    attempts: 10,
    backoff: { type: "exponential", delay: 5000 },
    removeOnComplete: 100,
    removeOnFail: 100,
  },
};

export function createQueue(name) {
  if (isTest) {
    return { add: async () => {} };
  }

  return new Queue(name, {
    connection: redis,
    ...defaultQueueOptions,
    limiter: { max: 10, duration: 1000 },
  });
}

export function createWorker(name, processor, options = {}) {
  if (isTest) return;

  const worker = new Worker(name, processor, {
    connection: redis,
    concurrency: 1,
    autorun: true,
    ...options,
  });

  worker.on("completed", (job) => infoLogger(`Job ${job.id} completed`));
  worker.on("failed", (job, err) => errorLogger(`Job ${job.id} failed`, err));
  worker.on("error", (err) => errorLogger(`Worker error`, err));

  return worker;
}

export async function listAllJobs(queue) {
  try {
    const jobsPromise = queue.getJobs([
      "waiting",
      "delayed",
      "active",
      "failed",
      "completed",
    ]);

    const countsPromise = queue.getJobCounts();

    const [jobs, counts] = await Promise.all([jobsPromise, countsPromise]);

    infoLogger(`\n=== ${queue.name} Queue Status ===`);
    infoLogger(`Total jobs: ${jobs.length}`);

    for (const job of jobs) {
      infoLogger(
        `${job.id} - ${job.name} - ${job.data?.event?.id} - ${job.state}`
      );
    }
    // Get counts
    infoLogger("\nJob counts:", counts);

    return jobs;
  } catch (error) {
    console.error("Error listing jobs:", error);
    return [];
  }
}
