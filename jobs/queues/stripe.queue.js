import QueueManager from "../../configs/bullMQ.config.js";
const stripeQueue = QueueManager.createQueue("stripe-events").queue;
export default stripeQueue;
