import { sequelize } from "../../configs/database.js";
import orderService from "../../modules/order/order.services.js";
import { NOTIFICATION_EVENTS, STRIPE_EVENTS } from "../../configs/constants.js";
import { debugLogger, errorLogger, infoLogger } from "../../utils/loggers.js";
import stripeServices from "../../services/stripe.service.js";
import notificationQueue from "../queues/notification.queue.js";
export async function stripeProcessor(job) {
  const startTime = Date.now();
  const event = job.data.event;
  const eventId = event.id;
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
            status: "active",
            userId: metadata.userId,
            serviceId: metadata.serviceId,
            relatedId: metadata.relatedId,
            relatedType: metadata.relatedType,
            serviceProviderId: metadata.serviceProviderId,
            stripePaymentIntentId: pi.id,
            currency: "usd",
          };
          await orderService.createOrder(orderData, t);
          debugLogger(`Created order for payment ${pi.id}`);
          await notificationQueue.add(
            NOTIFICATION_EVENTS.PAYMENT_SUCCESS,
            orderData
          );
          debugLogger(`adding to notification queue payment ${pi.id}`);
          break;
        }
        case STRIPE_EVENTS.PAYMENT_FAILED: {
          debugLogger(`Payment Failed: ${event.id}`);
          break;
        }
        default:
          debugLogger(`Unhandled Stripe event: ${event.type} - ${event.id}`);
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
