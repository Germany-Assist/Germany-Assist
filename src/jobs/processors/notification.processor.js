import { NOTIFICATION_EVENTS } from "../../configs/constants.js";
import { errorLogger } from "../../utils/loggers.js";
import handleCommentCreated from "./notification.handlers/handleComment.js";
import handlePaymentSuccesses from "./notification.handlers/handlePaymentSuccesses.js";

const handlers = {
  [NOTIFICATION_EVENTS.PAYMENT_SUCCESS]: handlePaymentSuccesses,
  [NOTIFICATION_EVENTS.COMMENT_CREATED]: handleCommentCreated,
};

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
    throw error;
  }
}

export default notificationProcessor;
