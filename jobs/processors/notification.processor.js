import db from "../../database/dbIndex.js";
import emailServices from "../../services/email.services.js";
import socketNotificationServices from "../../sockets/services/notificationService.js";
import { NOTIFICATION_EVENTS } from "../../configs/constants.js";
import { errorLogger } from "../../utils/loggers.js";
async function notificationProcessor(job) {
  const data = job.data;
  try {
    switch (job.name) {
      case NOTIFICATION_EVENTS.PAYMENT_SUCCESS:
        const { service_id, timeline_id } = data;
        const user = await db.User.findByPk(data.user_id, {
          attributes: ["email"],
        });
        const service = await db.Service.findByPk(service_id, {
          include: [
            {
              model: db.ServiceProvider,
            },
            {
              model: db.Timeline,
              where: { id: timeline_id },
              attributes: ["label"],
            },
          ],
        });
        const notificationData = {
          message: `Successful payment from user ${user.email} for timeline ${service.Timelines[0].label} of service ${service.title} `,
          url: "",
          type: "info",
          user_id: data.user_id,
          service_provider_id: data.service_provider_id,
        };

        const notification = await db.Notification.create(notificationData);

        await emailServices.sendNotificationPaymentEmail(
          user.email,
          service.ServiceProvider.email,
          notificationData.message
        );
        socketNotificationServices.sendSocketNotification(data.user_id, {
          message: notificationData.message,
          id: notification.id,
        });
        break;
      case NOTIFICATION_EVENTS.COMMENT_CREATED:
        break;
      default:
        return;
    }
  } catch (error) {
    errorLogger(error);
    throw error;
  }
}
export default notificationProcessor;
