import cron from "node-cron";
import db from "../database/index.js";
import { Op, Sequelize } from "sequelize";
import { sequelize } from "../configs/database.js";
import { errorLogger, infoLogger } from "../utils/loggers.js";
const testDuration = "0 * * * * *";
const actualDuration = "0 0 0 * * *";
const payoutCron = cron.schedule("0 * * * * *", async () => {
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
      },
    );
    if (updated[0] > 0) {
      const payouts = updated[1].map((i) => {
        return {
          orderId: i.id,
          amount: Number(i.amount),
          serviceProviderId: order.serviceProviderId,
          amountToPay: Number(i.amount) * 0.8,
          currency: i.currency,
          status: "pending",
        };
      });
      await db.Payout.bulkCreate(payouts, { transaction });
      infoLogger(`Successfully moved ${updated[0]} orders to payouts`);
    }
    infoLogger(`No closed Order ready to move`);
    await transaction.commit();
  } catch (err) {
    await transaction.rollback();
    errorLogger(err);
  }
});

payoutCron.start();

export default payoutCron;
