import db from "../../database/index.js";
// Service.serviceProviderId:serviceProviderId,

export async function createPayout(payoutData, transaction) {
  await db.Payout.create(payoutData, { transaction });
}
export async function getOrderForCheckoutPayouts({
  orderId,
  SPID,
  transaction,
}) {
  return await db.Order.findOne({
    where: { id: orderId },
    raw: false,
    include: [
      {
        model: db.Service,
        where: { serviceProviderId: SPID },
        attributes: [],
        required: true,
      },
    ],
    transaction,
  });
}
export async function getOrder(filters) {
  const order = await db.Order.findOne({
    where: filters,
    raw: true,
    nest: true,
  });
  if (!order)
    throw new AppError(404, "Order not found", true, "Order not found");
  return order;
}
const orderRepository = { getOrderForCheckoutPayouts, getOrder, createPayout };
export default orderRepository;
