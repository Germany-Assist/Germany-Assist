import { sequelize } from "../../database/connection.js";
import orderService from "../../services/order.services.js";
import { NOTIFICATION_EVENTS } from "../../utils/constants.js";
import { errorLogger, infoLogger } from "../../utils/loggers.js";
import stripeServices from "../../services/stripe.service.js";
import notificationQueue from "../queues/notification.queue.js";

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
        infoLogger(`im creating the stripe event ${event.id}`);
        break;
      }
      case "payment_intent.succeeded": {
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
        await notificationQueue.add(
          NOTIFICATION_EVENTS.PAYMENT_SUCCESS,
          orderData
        );
        break;
      }
      case "payment_intent.payment_failed": {
        infoLogger("❌ Payment Failed");
        break;
      }
      default:
        infoLogger(
          `Unhandled Stripe event type: ${event.type} with the id of ${event.id}`
        );
    }
    await stripeServices.updateStripeEvent(event.id, "processed", t);
    infoLogger(`im updating as the stripe event  processed ${event.id}`);
    await t.commit();
  } catch (err) {
    await t.rollback();
    errorLogger(err);
    throw err;
  }
}
export default stripeProcessor;
