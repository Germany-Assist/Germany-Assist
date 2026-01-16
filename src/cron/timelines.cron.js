import cron from "node-cron";
import db from "../database/index.js";
import { Op, Sequelize } from "sequelize";
import { sequelize } from "../configs/database.js";
import { errorLogger, infoLogger } from "../utils/loggers.js";
const testDuration = "0 * * * * *";
const actualDuration = "* * 0 * * *";
const timelinesClosingCron = cron.schedule("0 0 0 * * *", async () => {
  const transaction = await sequelize.transaction();
  try {
    const update = await db.Order.update(
      { status: "pending_completion" },
      {
        where: {
          id: orderId,
          status: "active",
          type: "timeline",
          serviceProviderId,
        },
        raw: true,
        transaction,
      }
    );
    infoLogger(`No closed Order ready to move`);
    await transaction.commit();
  } catch (err) {
    await transaction.rollback();
    errorLogger("Payout cron failed:", err);
  }
});

timelinesClosingCron.start();

export default timelinesClosingCron;
