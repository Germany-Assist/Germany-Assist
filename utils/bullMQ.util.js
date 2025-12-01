import { Queue, Worker } from "bullmq";
import stripeServices from "../services/stripe.service.js";
import orderService from "../services/order.services.js";
import { sequelize } from "../database/connection.js";
import { errorLogger, infoLogger } from "./loggers.js";
import redis from "../configs/redis.js";
import { NODE_ENV } from "../configs/serverConfig.js";
import { writeFile } from "node:fs/promises";
import cron from "node-cron";
import db from "../database/dbIndex.js";
import { Op } from "sequelize";
import { deleteFromS3 } from "../configs/s3Configs.js";
import workersProcessors from "./workers.js";
import { NOTIFICATION_EVENTS } from "./constants.js";

export async function stripeProcessor(job) {
  const event = job.data.event;
  const eventId = event.id;
  const stripeEvent = await stripeServices.getStripeEvent(eventId);
  if (stripeEvent?.status === "processed") return;
  const metadata = event.data.object?.metadata;
  const t = await sequelize.transaction();
  try {
    switch (event.type) {
      case "payment_intent.created": {
        await stripeServices.createStripeEvent(event, "pending");
        infoLogger(`im creating the stripe event ${event.id}`);
        break;
      }
      case "payment_intent.succeeded": {
        const pi = event.data.object;
        const orderData = {
          amount: pi.amount,
          status: "paid",
          user_id: metadata.userId,
          service_id: metadata.serviceId,
          timeline_id: metadata.timelineId,
          service_provider_id: metadata.serviceProviderId,
          stripe_payment_intent_id: pi.id,
          currency: "usd",
        };
        await orderService.createOrder(orderData, t);
        await notificationQueue.add(
          NOTIFICATION_EVENTS.PAYMENT_SUCCESS,
          orderData
        );
        break;
      }
      case "payment_intent.payment_failed": {
        infoLogger("❌ Payment Failed");
        break;
      }
      default:
        infoLogger(
          `Unhandled Stripe event type: ${event.type} with the id of ${event.id}`
        );
    }
    await stripeServices.updateStripeEvent(event.id, "processed", t);
    infoLogger(`im updating as the stripe event  processed ${event.id}`);
    await t.commit();
  } catch (err) {
    console.log(err);
    await t.rollback();
    errorLogger(err);
    throw err;
  }
}

let stripeQueue;
let cleanupQueue;
let notificationQueue;
let deadLetterQueue;
// i cant have them to run the queues in testing since redis will fail the whole app
if (NODE_ENV !== "test") {
  //queues
  cleanupQueue = new Queue("cleanup-queue", { connection: redis });
  notificationQueue = new Queue("notification-events", { connection: redis });
  stripeQueue = new Queue("stripe-events", { connection: redis });
  deadLetterQueue = new Queue("dead-letter", { connection: redis });

  //workers
  const stripeWorker = new Worker("stripe-events", stripeProcessor, {
    connection: redis,
  });
  const cleanupWorker = new Worker(
    "cleanup-queue",
    async (job) => {
      const { id, url } = job.data;
      try {
        console.log(`🗑️ Deleted S3 file: ${url}`);
        await db.Asset.destroy({ where: { id }, force: true });
        // flag
        // await deleteFromS3(url);
        console.log(`🧹 Deleted asset record ${id}`);
      } catch (err) {
        console.log(err);
        console.error(`❌ Failed to delete asset ${id}:`, err.message);
        throw err;
      }
    },
    { connection: redis }
  );
  const dlqWorker = new Worker(
    "dead-letter",
    async (job) => {
      infoLogger(`📥 Handling DLQ job ${job.id}`);
      await writeFile("./emergencyDLQ.txt", JSON.stringify(job), { flag: "a" });
    },
    { connection: redis }
  );
  const notificationWorker = new Worker(
    "notification-events",
    workersProcessors.notificationProcessor,
    { connection: redis }
  );

  stripeWorker.on("completed", (job) => {
    infoLogger(`✅ Job ${job.id} is completed`);
  });

  stripeWorker.on("failed", async (job, err) => {
    errorLogger(`❌ Job ${job.id} failed:`, err.message);
    if (job.attemptsMade >= job.opts.attempts) {
      infoLogger(`🚨 Job ${job.id} reached max attempts, moving to DLQ`);
      await deadLetterQueue.add("failed-job", {
        id: job.id,
        name: job.name,
        data: job.data,
        error: err.message,
        stack: err.stack,
      });
    }
  });
}

export const enqueueDeletedAssets = async () => {
  const assets = await db.Asset.findAll({
    paranoid: false,
    where: {
      deleted_at: { [Op.not]: null },
    },
  });
  for (const asset of assets) {
    await cleanupQueue.add("deleteAsset", { id: asset.id, url: asset.url });
  }
  console.log(`✅ Added ${assets.length} assets for cleanup`);
};

if (NODE_ENV !== "test") {
  cron.schedule("0 0 * * * *", enqueueDeletedAssets);
}

export default stripeQueue;
