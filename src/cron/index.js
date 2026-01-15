import { infoLogger } from "../utils/loggers.js";
import payoutCron from "./payout.cron.js";

export async function shutdownCron() {
  infoLogger("shuting down the cron jobs");
  await payoutCron.stop();
}
