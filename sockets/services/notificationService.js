import { getIO } from "../index.js";

export function sendNotification(userId, payload) {
  const io = getIO();
  async function ack() {
    console.log("im gonna address this a bit later");
  }
  io.to(`user:${userId}`).emit("notification", payload, ack);
}
