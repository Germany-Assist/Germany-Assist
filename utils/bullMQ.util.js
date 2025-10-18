import { Queue, Worker } from "bullmq";
import stripeServices, { getStripeEvent } from "../services/stripe.service.js";
import paymentServices from "../services/payment.service.js";
import orderService from "../services/order.services.js";
import orderItemServices from "../services/itemOrder.services.js";
import { sequelize } from "../database/connection.js";
import { errorLogger, infoLogger } from "./loggers.js";
import redis from "../configs/redis.js";

import { NODE_ENV } from "../configs/serverConfig.js";
export async function stripeProcessor(job) {
  const event = job.data.event;
  const eventId = event.id;
  const stripeEvent = await stripeServices.getStripeEvent(eventId);
  if (stripeEvent?.status === "processed") return;
  const metadata = event.data.object?.metadata;
  let items = [];
  try {
    items = JSON.parse(metadata.items || "[]");
  } catch (err) {
    throw new Error("Invalid metadata.items JSON");
  }
  const t = await sequelize.transaction();
  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const pi = event.data.object;
        await paymentServices.updatePayment("succeeded", pi.id, t);
        await orderService.updateOrder(
          "paid",
          pi.amount,
          pi.metadata.orderId,
          t
        );
        break;
      }
      case "payment_intent.payment_failed": {
        const pi = event.data.object;
        await paymentServices.updatePayment("failed", pi.id, t);
        await orderService.updateOrder(
          "canceled",
          pi.amount,
          pi.metadata.orderId,
          t
        );
        break;
      }
      default:
        infoLogger(`Unhandled Stripe event type: ${event.type}`);
    }
    await stripeServices.updateStripeEvent(event.id, "processed", t);
    await t.commit();
  } catch (err) {
    await t.rollback();
    errorLogger(err);
    throw err;
  }
}
let stripeQueue;
if (NODE_ENV !== "test") {
  stripeQueue = new Queue("stripe-events", {
    connection: redis,
  });

  const deadLetterQueue = new Queue("dead-letter", {
    connection: redis,
  });

  const stripeWorker = new Worker("stripe-events", stripeProcessor, {
    connection: redis,
  });

  const dlqWorker = new Worker(
    "dead-letter",
    async (job) => {
      infoLogger(`📥 Handling DLQ job ${job.id}`);
    },
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
export default stripeQueue;
