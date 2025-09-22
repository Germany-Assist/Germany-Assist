import { AppError } from "../utils/error.class.js";
import { sequelize } from "../database/connection.js";
import { errorLogger, infoLogger } from "../utils/loggers.js";
import stripeUtils from "../utils/stripe.util.js";
import stripeServices, {
  createStripeEvent,
  getStripeEvent,
} from "../services/stripe.service.js";
import paymentServices from "../services/payment.service.js";
import orderService from "../services/order.services.js";
import orderItemServices from "../services/itemOrder.services.js";

export async function processPaymentWebhook(req, res, next) {
  const sig = req.headers["stripe-signature"];
  let event = stripeUtils.verifyStripeWebhook(req.body, sig);
  if (!event) return res.status(400).send(`Webhook failed to verify`);
  const existingEvent = await stripeServices.getStripeEvent(event.id);
  if (existingEvent) {
    infoLogger(`Event ${event.id} already processed`);
    return res.json({ received: true });
  }

  infoLogger(event.type);
  const metadata = event.data.object?.metadata;
  if (!metadata || !metadata.items || metadata.items.length < 1) {
    throw new AppError(
      400,
      "recording payment failed: missing metadata/items",
      false
    );
  }

  const items = JSON.parse(metadata.items);
  const t = await sequelize.transaction();

  try {
    await stripeServices.createStripeEvent(event, "pending", t);
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
    res.json({ received: true });
  } catch (error) {
    await t.rollback();
    next(error);
  }
}

const paymentController = { processPaymentWebhook };
export default paymentController;
