import db from "../database/dbIndex.js";
import { errorLogger } from "../utils/loggers.js";

export function registerEvents(socket, io) {
  socket.join(`user:${socket.auth.id}`);

  socket.on("markNotificationAsRead", async ({ id: notificationId }) => {
    try {
      await db.Notification.update(
        { isRead: true },
        { where: { id: notificationId, user_id: socket.auth.id } }
      );
    } catch (error) {
      errorLogger(error);
    }
  });

  socket.on("disconnect", () => {
    console.log(`Socket ${socket.id} disconnected`);
  });
}
