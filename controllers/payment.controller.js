import { infoLogger } from "../utils/loggers.js";
import stripeUtils from "../utils/stripe.util.js";
import stripeQueue from "../utils/bullMQ.util.js";

export async function processPaymentWebhook(req, res, next) {
  try {
    const sig = req.headers["stripe-signature"];
    let event = stripeUtils.verifyStripeWebhook(req.body, sig);
    if (!event) return res.status(400).send(`Webhook failed to verify`);
    res.json({ received: true });
    await stripeQueue.add("process", { event });
    infoLogger(event.type);
  } catch (error) {
    next(error);
  }
}

const paymentController = { processPaymentWebhook };

export default paymentController;
