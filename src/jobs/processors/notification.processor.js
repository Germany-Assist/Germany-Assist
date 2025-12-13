import db from "../../database/index.js";
import emailServices from "../../services/email.services.js";
import socketNotificationServices from "../../sockets/services/notificationService.js";
import { NOTIFICATION_EVENTS } from "../../configs/constants.js";
import { errorLogger, infoLogger } from "../../utils/loggers.js";
import { sequelize } from "../../configs/database.js";

async function handlePaymentSuccess(data) {
  const { serviceId, timelineId, userId, serviceProviderId } = data;

  const [user, service] = await Promise.all([
    db.User.findByPk(userId, { attributes: ["email"] }),
    db.Service.findByPk(serviceId, {
      include: [
        { model: db.ServiceProvider },
        {
          model: db.Timeline,
          where: { id: timelineId, isArchived: false },
          attributes: ["label"],
        },
      ],
    }),
  ]);

  if (!user || !service) {
    throw new Error(
      `User or Service not found: userId=${userId}, serviceId=${serviceId}`
    );
  }

  const timelineLabel = service.Timelines?.[0]?.label || "unknown timeline";

  const notificationData = {
    message: `Successful payment from user ${user.email} for timeline ${timelineLabel} of service ${service.title}`,
    url: "",
    type: "info",
    userId: userId,
    metadata: {
      serviceProviderId: serviceProviderId,
      serviceId: service.id,
    },
  };

  const notification = await sequelize.transaction(async (t) => {
    return db.Notification.create(notificationData, { transaction: t });
  });

  socketNotificationServices.sendSocketNotification(userId, {
    message: notificationData.message,
    id: notification.id,
  });

  await emailServices.sendNotificationPaymentEmail(
    user.email,
    service.ServiceProvider?.email,
    notificationData.message
  );

  infoLogger(
    `Notification processed for payment: userId=${userId}, serviceId=${service.id}`
  );
}

async function handleCommentCreated(data) {
  infoLogger("Comment created notification received", data);
}

const handlers = {
  [NOTIFICATION_EVENTS.PAYMENT_SUCCESS]: handlePaymentSuccess,
  [NOTIFICATION_EVENTS.COMMENT_CREATED]: handleCommentCreated,
};

/**
 * Notification processor for BullMQ
 */
async function notificationProcessor(job) {
  const data = job.data;

  if (!handlers[job.name]) {
    errorLogger(`Unhandled notification event: ${job.name}`, {
      jobId: job.id,
      data,
    });
    return;
  }
  try {
    await handlers[job.name](data);
  } catch (error) {
    errorLogger({
      jobId: job.id,
      eventName: job.name,
      userId: data.userId,
      error,
      stack: error.stack,
    });
    throw error; // allow BullMQ retries
  }
}

export default notificationProcessor;
