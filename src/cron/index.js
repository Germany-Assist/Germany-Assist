import { infoLogger } from "../utils/loggers.js";
import payoutCron from "./payout.cron.js";
import timelinesClosingCron from "./timelines.cron.js";

export async function shutdownCron() {
  infoLogger("shuting down the cron jobs");
  await payoutCron.stop();
  await timelinesClosingCron.stop();
}
