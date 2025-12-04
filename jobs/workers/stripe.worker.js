import stripeProcessor from "../processors/stripe.processor.js";
import { createWorker } from "../../configs/bullMQ.config.js";
import { errorLogger, infoLogger } from "../../utils/loggers.js";
import { NODE_ENV } from "../../configs/serverConfig.js";

try {
  const stripeWorker = createWorker("stripe-events", stripeProcessor, {
    concurrency: 2,
    lockDuration: 60000,
  });
  if (NODE_ENV != "test") {
    // Add more event listeners
    stripeWorker.on("ready", () => {
      console.log("✅ Stripe worker is ready and listening for jobs");
    });
    stripeWorker.on("active", (job) => {
      console.log(`🎯 Stripe worker started processing job ${job.id}`);
    });
    stripeWorker.on("completed", (job) => {
      console.log(`🏁 Stripe worker finished job ${job.id}`);
    });
    stripeWorker.on("failed", (job, err) => {
      console.error(`💥 Stripe worker failed job ${job.id}:`, err.message);
    });
    stripeWorker.on("error", (err) => {
      console.error("🔥 Stripe worker error:", err);
    });
    stripeWorker.on("drained", () => {
      console.log("📭 Stripe Queue drained - no more jobs");
    });
  }
  infoLogger("✅ Stripe worker started successfully");
} catch (error) {
  errorLogger("❌ Failed to start stripe worker:", error);
  process.exit(1);
}
