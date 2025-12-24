import { func } from "testdouble";
import { getIO } from "../index.js";

export function sendSocketNotification(userId, payload) {
  const io = getIO();
  async function ack() {
    console.log("im gonna address this a bit later");
  }
  io.to(`user:${userId}`).emit("notification", payload, ack);
}
export function sendSocketNotificationToUsers(usersIds, payload) {
  const io = getIO();
  async function ack() {
    console.log("im gonna address this a bit later");
  }
  usersIds.forEach((id) => {
    io.to(`user:${id}`).emit("notification", payload, ack);
  });
}

const socketNotificationServices = {
  sendSocketNotification,
  sendSocketNotificationToUsers,
};
export default socketNotificationServices;
