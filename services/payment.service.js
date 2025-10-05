import { Op } from "sequelize";
import db from "../database/dbIndex.js";

export async function createPayment(intentId, totalAmount, orderId, t) {
  const payment = await db.Payment.create(
    {
      stripe_payment_intent_id: intentId,
      amount: totalAmount,
      currency: "usd",
      status: "requires_payment",
      related_type: "service",
      related_id: orderId,
    },
    { transaction: t, raw: true }
  );
  return payment;
}
export async function updatePayment(status, piId, t) {
  return await db.Payment.update(
    { status },
    {
      where: {
        stripe_payment_intent_id: piId,
        status: { [Op.ne]: status },
      },
      transaction: t,
    }
  );
}

const paymentServices = { createPayment, updatePayment };
export default paymentServices;
