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
    limiter: {
      max: 10,
      duration: 1000,
    },
  });
}

export function createWorker(name, processor, options = {}) {
  if (isTest) return;

  const worker = new Worker(name, processor, {
    concurrency: 1,
    connection: redis,
    lockDuration: 30000,
    stalledInterval: 60000,
    maxStalledCount: 2,
    autorun: true,
    ...options,
  });

  worker.on("completed", (job) => {
    infoLogger(`Job ${job.id} completed`);
  });

  worker.on("failed", (job, err) => {
    errorLogger(`Job ${job.id} failed:`, err);
  });

  worker.on("error", (err) => {
    errorLogger("Worker error:", err);
  });

  worker.on("stalled", (jobId) => {
    errorLogger(`Job ${jobId} stalled`);
  });

  worker.on("active", (job) => {
    infoLogger(`Job ${job.id} started processing`);
  });

  return worker;
}
