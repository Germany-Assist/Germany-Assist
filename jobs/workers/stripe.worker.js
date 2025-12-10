import stripeProcessor from "../processors/stripe.processor.js";
import { errorLogger, infoLogger } from "../../utils/loggers.js";
import { NODE_ENV } from "../../configs/serverConfig.js";
import QueueManager from "../../configs/bullMQ.config.js";
try {
  const stripeWorker = QueueManager.createWorker(
    "stripe-events",
    stripeProcessor,
    {
      concurrency: 2,
      lockDuration: 60000,
    }
  );
  if (NODE_ENV != "test") {
    // Add more event listeners
    stripeWorker.on("ready", () => {
      infoLogger("✅ Stripe worker is ready and listening for jobs");
    });
    stripeWorker.on("active", (job) => {
      infoLogger(`🎯 Stripe worker started processing job ${job.id}`);
    });
    stripeWorker.on("completed", (job) => {
      infoLogger(`🏁 Stripe worker finished job ${job.id}`);
    });
    stripeWorker.on("failed", (job, err) => {
      errorLogger(`💥 Stripe worker failed job ${job.id}:`, err.message);
    });
    stripeWorker.on("error", (err) => {
      errorLogger("🔥 Stripe worker error:", err);
    });
    stripeWorker.on("drained", () => {
      infoLogger("📭 Stripe Queue drained - no more jobs");
    });
  }
  infoLogger("✅ Stripe worker started successfully");
} catch (error) {
  errorLogger("❌ Failed to start stripe worker:", error);
  process.exit(1);
}
