import { Worker } from "bullmq";
import stripeServices, { getStripeEvent } from "../services/stripe.service";
import { redis } from "./stripe.util";
import paymentServices from "../services/payment.service";
import orderService from "../services/order.services";
import orderItemServices from "../services/itemOrder.services";
import { sequelize } from "../database/connection";
import { infoLogger } from "./loggers";
import { AppError } from "./error.class";

const worker = new Worker(
  "stripe-events",
  async (event) => {
    const eventId = event.id;
    const stripeEvent = await getStripeEvent(eventId);
    if (!stripeEvent || stripeEvent.status == "processed") return;

    const metadata = event.data.object?.metadata;
    const items = JSON.parse(metadata.items);
    const t = await sequelize.transaction();
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
        await orderItemServices.updateManyOrderItems(items, t);
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
        infoLogger(` Unhandled Stripe event type: ${event.type}`);
    }
    await stripeServices.updateStripeEvent(event.id, "processed", t);
    await t.commit();
  },
  { connection: redis }
);

worker.on("failed", (job, err) => {
  errorLogger(err);
  if (job.attemptsMade >= job.opts.attempts) {
  }
});
