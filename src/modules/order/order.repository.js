import db from "../../database/index.js";
import { AppError } from "../../utils/error.class.js";

export async function getServiceForPayment({ serviceId, optionId, type }) {
  const include = [];
  if (type === "oneTime") {
    include.push({
      model: db.Variant,
      where: { id: optionId },
      required: true,
    });
  } else if (type === "timeline") {
    include.push({
      model: db.Timeline,
      where: { id: optionId },
      required: true,
    });
  }
  const service = await db.Service.findOne({
    raw: true,
    nest: true,
    where: { id: serviceId, published: true, approved: true, rejected: false },
    include,
  });
  if (!service) throw new AppError(500, "failed to find service", false);
  return service;
}

export async function createOrder(data, t) {
  return await db.Order.create(data, {
    raw: true,
    transaction: t,
  });
}

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
const orderRepository = {
  getOrderForCheckoutPayouts,
  getOrder,
  createPayout,
  getServiceForPayment,
  createOrder,
};
export default orderRepository;
