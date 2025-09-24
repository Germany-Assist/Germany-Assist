import { STRIPE_SK, STRIPE_WEBHOOK_SECRET } from "../configs/serverConfig.js";
import Stripe from "stripe";
import { errorLogger } from "./loggers.js";
import { Queue } from "bullmq";
import Redis from "ioredis";
import { REDIS_HOST, REDIS_PORT } from "../configs/databaseConfig.js";
let stripe;
try {
  stripe = new Stripe(STRIPE_SK);
} catch (error) {
  errorLogger(error);
}
export const redis = new Redis({
  host: REDIS_HOST,
  port: REDIS_PORT,
});
export const stripeQueue = new Queue("stripe-events", { redis });

export async function createPaymentIntent(order, items, totalAmount) {
  return await stripe.paymentIntents.create({
    amount: Math.round(totalAmount * 100),
    currency: "usd",
    metadata: {
      orderId: order.id,
      totalAmount,
      items: JSON.stringify(items),
    },
    automatic_payment_methods: { enabled: true, allow_redirects: "never" },
  });
}
// verify Stripe webhook signature
export function verifyStripeWebhook(body, sig) {
  try {
    const event = stripe.webhooks.constructEvent(
      body,
      sig,
      STRIPE_WEBHOOK_SECRET
    );
    return event;
  } catch (err) {
    return false;
  }
}

const stripeUtils = {
  stripe,
  createPaymentIntent,
  verifyStripeWebhook,
};
export default stripeUtils;
