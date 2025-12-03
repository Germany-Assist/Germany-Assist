import { sequelize } from "../../database/connection.js";
import orderService from "../../services/order.services.js";
import { NOTIFICATION_EVENTS, STRIPE_EVENTS } from "../../configs/constants.js";
import { errorLogger, infoLogger } from "../../utils/loggers.js";
import stripeServices from "../../services/stripe.service.js";
import notificationQueue from "../queues/notification.queue.js";
export async function stripeProcessor(job) {
  const startTime = Date.now();
  infoLogger(`Starting job ${job.id} - ${job.data.event.type}`);
  const event = job.data.event;
  const eventId = event.id;
  // Add timeout to prevent infinite processing
  const timeout = 55000; // 55 seconds (just under lockDuration)
  try {
    const stripeEvent = await stripeServices.getStripeEvent(eventId);
    if (stripeEvent?.status === "processed") {
      infoLogger(`Event ${eventId} already processed, skipping`);
      return;
    }

    const metadata = event.data.object?.metadata;
    const t = await sequelize.transaction();

    try {
      switch (event.type) {
        case STRIPE_EVENTS.PAYMENT_CREATED: {
          await stripeServices.createStripeEvent(event, "pending");
          infoLogger(`Created stripe event ${event.id}`);
          break;
        }
        case STRIPE_EVENTS.PAYMENT_SUCCESS: {
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
          infoLogger(`Created order for payment ${pi.id}`);
          await notificationQueue.add(
            NOTIFICATION_EVENTS.PAYMENT_SUCCESS,
            orderData
          );
          infoLogger(`adding to notification queue payment ${pi.id}`);
          break;
        }
        case STRIPE_EVENTS.PAYMENT_FAILED: {
          infoLogger(`Payment Failed: ${event.id}`);
          break;
        }
        default:
          infoLogger(`Unhandled Stripe event: ${event.type} - ${event.id}`);
      }

      await stripeServices.updateStripeEvent(event.id, "processed", t);
      await t.commit();

      const processingTime = Date.now() - startTime;
      infoLogger(`Job ${job.id} completed in ${processingTime}ms`);
    } catch (err) {
      await t.rollback();
      errorLogger(`Transaction failed for job ${job.id}:`, err);
      throw err;
    }
  } catch (err) {
    errorLogger(`Job ${job.id} failed:`, err);
    throw err;
  }
}
export default stripeProcessor;
