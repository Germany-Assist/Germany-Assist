import stripeQueue from "../jobs/queues/stripe.queue.js";
import stripeUtils from "../utils/stripe.util.js";

export async function processPaymentWebhook(req, res, next) {
  try {
    const sig = req.headers["stripe-signature"];
    let event = stripeUtils.verifyStripeWebhook(req.body, sig);
    if (!event) return res.status(400).send(`Webhook failed to verify`);
    await stripeQueue.add(
      "stripe-event",
      { event },
      {
        delay: 0,
      }
    );
    res.json({ received: true });
  } catch (error) {
    next(error);
  }
}

const paymentController = { processPaymentWebhook };

export default paymentController;
