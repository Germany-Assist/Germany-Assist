import { Queue } from "bullmq";
import queueConfig from "../../configs/bullMQ.config.js";

const stripeQueue = new Queue("stripe-events", queueConfig);
export default stripeQueue;
