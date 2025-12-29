import db from "../../../database/index.js";
import socketNotificationServices from "../../../sockets/services/notificationService.js";
import { sequelize } from "../../../configs/database.js";
import emailService from "../../../services/email/email.service.js";
import { AppError } from "../../../utils/error.class.js";

async function handlePaymentSuccesses(data) {
  const { serviceId, timelineId, userId, serviceProviderId } = data;
  const [user, service] = await Promise.allSettled([
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
    throw new AppError(
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

  await emailService.sendNotificationPaymentEmail(
    user.email,
    service.ServiceProvider?.email,
    notificationData.message
  );

  infoLogger(
    `Notification processed for payment: userId=${userId}, serviceId=${service.id}`
  );
}

export default handlePaymentSuccesses;
