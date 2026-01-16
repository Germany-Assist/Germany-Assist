import cron from "node-cron";
import db from "../database/index.js";
import { Op, Sequelize } from "sequelize";
import { sequelize } from "../configs/database.js";
import { errorLogger, infoLogger } from "../utils/loggers.js";

const testDuration = "0 * * * * *";
const actualDuration = "* * 0 * * *";
const timelinesClosingCron = cron.schedule("*/3 * * * * *", async () => {
  const transaction = await sequelize.transaction();
  try {
    const updated = await db.Order.update(
      { status: "pending_completion" },
      {
        where: {
          status: "active",
          relatedType: "timeline",
          relatedId: {
            [Op.in]: Sequelize.literal(`(
          SELECT id FROM "timelines"
          WHERE "end_date" <= NOW()
        )`),
          },
        },

        raw: true,
        transaction,
        returning: true,
      }
    );
    console.log(updated);
    infoLogger(`No timeline was closed`);
    await transaction.commit();
  } catch (err) {
    await transaction.rollback();
    errorLogger("timeline cron failed:", err);
  }
});

timelinesClosingCron.start();

export default timelinesClosingCron;
