import { Queue, Worker } from "bullmq";
import stripeServices from "../services/stripe.service.js";
import orderService from "../services/order.services.js";
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
  const t = await sequelize.transaction();
  try {
    switch (event.type) {
      case "payment_intent.created": {
        await stripeServices.createStripeEvent(event, "pending");
        console.log(`im creating the stripe event ${event.id}`);
        break;
      }
      case "payment_intent.succeeded": {
        const pi = event.data.object;
        const orderData = {
          amount: pi.amount,
          status: "paid",
          user_id: metadata.userId,
          service_id: metadata.serviceId,
          contract: "testing",
          stripe_payment_intent_id: pi.id,
          currency: "usd",
        };
        await orderService.createOrder(orderData, t);
        break;
      }
      case "payment_intent.payment_failed": {
        console.log("payment failed");
        break;
      }
      default:
        infoLogger(
          `Unhandled Stripe event type: ${event.type} with the id of ${event.id}`
        );
    }
    await stripeServices.updateStripeEvent(event.id, "processed", t);
    console.log(`im updating as the stripe event  processed ${event.id}`);

    await t.commit();
  } catch (err) {
    await t.rollback();
    console.log(err);
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
