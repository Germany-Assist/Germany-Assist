import cron from "node-cron";
import db from "../database/index.js";
import { Op, Sequelize } from "sequelize";
import { sequelize } from "../configs/database.js";
//TODO WHERE I Stopped
const payoutCron = cron.schedule("*/3 * * * * *", async () => {
  const t = await sequelize.transaction();
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
        transaction: t,
      }
    );
    console.log(updated);
    await t.commit();
    // await db.Payout.create(payoutData, { transaction });
  } catch (err) {
    await t.rollback();

    console.error("Payout cron failed:", err);
  }
});

payoutCron.start();

export default payoutCron;
