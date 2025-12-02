import { Worker } from "bullmq";
import stripeProcessor from "../processors/stripe.processor.js";
import queueConfig from "../../configs/bullMQ.config.js";
const stripeWorker = new Worker("stripe-events", stripeProcessor, queueConfig);
