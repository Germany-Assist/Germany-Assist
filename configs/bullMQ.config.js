import { REDIS_HOST, REDIS_PASSWORD, REDIS_PORT } from "./redis.js";

export const connection = {
  host: REDIS_HOST,
  port: REDIS_PORT,
  password: REDIS_PASSWORD,
};

export const queueConfig = {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 3000 },
    removeOnComplete: true,
    removeOnFail: false,
  },
};
export default queueConfig;
// i cant have them to run the queues in testing since redis will fail the whole app

// const cleanupQueue = new Queue("cleanup-queue", { connection: redis });

// const deadLetterQueue = new Queue("dead-letter", { connection: redis });

// const cleanupWorker = new Worker(
//   "cleanup-queue",
//   async (job) => {
//     const { id, url } = job.data;
//     try {
//       console.log(`🗑️ Deleted S3 file: ${url}`);
//       await db.Asset.destroy({ where: { id }, force: true });
//       // flag
//       // await deleteFromS3(url);
//       console.log(`🧹 Deleted asset record ${id}`);
//     } catch (err) {
//       console.log(err);
//       console.error(`❌ Failed to delete asset ${id}:`, err.message);
//       throw err;
//     }
//   },
//   { connection: redis }
// );
// const dlqWorker = new Worker(
//   "dead-letter",
//   async (job) => {
//     infoLogger(`📥 Handling DLQ job ${job.id}`);
//     await writeFile("./emergencyDLQ.txt", JSON.stringify(job), { flag: "a" });
//   },
//   { connection: redis }
// );

// stripeWorker.on("completed", (job) => {
//   infoLogger(`✅ Job ${job.id} is completed`);
// });

// stripeWorker.on("failed", async (job, err) => {
//   errorLogger(`❌ Job ${job.id} failed:`, err.message);
//   if (job.attemptsMade >= job.opts.attempts) {
//     infoLogger(`🚨 Job ${job.id} reached max attempts, moving to DLQ`);
//     await deadLetterQueue.add("failed-job", {
//       id: job.id,
//       name: job.name,
//       data: job.data,
//       error: err.message,
//       stack: err.stack,
//     });
//   }
// });

// export const enqueueDeletedAssets = async () => {
//   const assets = await db.Asset.findAll({
//     paranoid: false,
//     where: {
//       deleted_at: { [Op.not]: null },
//     },
//   });
//   for (const asset of assets) {
//     await cleanupQueue.add("deleteAsset", { id: asset.id, url: asset.url });
//   }
//   console.log(`✅ Added ${assets.length} assets for cleanup`);
// };

// if (NODE_ENV !== "test") {
//   cron.schedule("0 0 * * * *", enqueueDeletedAssets);
// }
// const Queues = {
//   stripeQueue,
//   notificationQueue,
//   cleanupQueue,
//   deadLetterQueue,
// };
// export default Queues;
