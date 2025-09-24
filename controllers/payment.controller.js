import { AppError } from "../utils/error.class.js";
import { sequelize } from "../database/connection.js";
import { errorLogger, infoLogger } from "../utils/loggers.js";
import stripeUtils, { stripeQueue } from "../utils/stripe.util.js";
import stripeServices, {
  createStripeEvent,
  getStripeEvent,
} from "../services/stripe.service.js";
import paymentServices from "../services/payment.service.js";
import orderService from "../services/order.services.js";
import orderItemServices from "../services/itemOrder.services.js";

export async function processPaymentWebhook(req, res, next) {
  try {
    const sig = req.headers["stripe-signature"];
    let event = stripeUtils.verifyStripeWebhook(req.body, sig);
    if (!event) return res.status(400).send(`Webhook failed to verify`);
    const metadata = event.data.object?.metadata;
    if (!metadata || !metadata.items || metadata.items.length < 1) {
      throw new AppError(
        400,
        "recording payment failed: missing metadata/items",
        false
      );
    }
    infoLogger(event.type);

    await stripeServices.createStripeEvent(event, "pending");
    await stripeQueue.add("process", { event });

    res.json({ received: true });
  } catch (error) {
    next(error);
  }
}

const paymentController = { processPaymentWebhook };
export default paymentController;
