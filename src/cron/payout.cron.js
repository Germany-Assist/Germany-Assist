import cron from "node-cron";
import db from "../database/index.js";
import { Op, Sequelize } from "sequelize";
import { sequelize } from "../configs/database.js";
//TODO WHERE I Stopped
const testDuration = "0 * * * * *";
const actualDuration = "* * 0 * * *";
const payoutCron = cron.schedule("*/3 * * * * *", async () => {
  const transaction = await sequelize.transaction();
  try {
    const updated = await db.Order.update(
      { status: "completed" },
      {
        where: {
          status: "pending_completion",
          updatedAt: {
            [Op.lte]: Sequelize.literal("NOW() - INTERVAL '7 days'"),
          },
          id: {
            [Op.notIn]: Sequelize.literal(`(
          SELECT "order_id"
          FROM "disputes"
          WHERE status != 'resolved'
        )`),
          },
        },
        returning: true,
        raw: true,
        transaction,
      }
    );
    if (updated[0].length > 0) return "nothing to update";
    await db.Payout.bulkCreate({ ...updated[1] }, { transaction });

    await transaction.commit();
  } catch (err) {
    await transaction.rollback();
    console.error("Payout cron failed:", err);
  }
});

payoutCron.start();

export default payoutCron;
