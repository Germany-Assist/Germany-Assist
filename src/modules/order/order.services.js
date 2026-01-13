import { sequelize } from "../../configs/database.js";
import db from "../../database/index.js";
import { AppError } from "../../utils/error.class.js";
import orderRepository from "./order.repository.js";

export async function createOrder(data, t) {
  return await db.Order.create(data, {
    raw: true,
    transaction: t,
  });
}
export async function getServiceForPaymentPrivate({
  serviceId,
  optionId,
  type,
}) {
  const include = [];
  let typeTable;
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
  return await db.Service.findOne({
    raw: true,
    nest: true,
    where: { id: serviceId, published: true, approved: true, rejected: false },
    include,
  });
}

export async function getOrder(filters) {
  const order = await db.Order.findOne({
    where: filters,
    raw: true,
  });
  if (!order)
    throw new AppError(404, "Order not found", true, "Order not found");
  return order;
}
export async function getOrderByIdAndSPID(filters, SPID) {
  const order = await db.Order.findOne({
    where: filters,
    raw: false,
    include: [
      {
        model: db.Service,
        where: { serviceProviderId: SPID },
        attributes: [],
        required: true,
      },
    ],
  });
  if (!order)
    throw new AppError(404, "Order not found", true, "Order not found");
  return order.toJSON();
}
export async function getOrders(filters = {}) {
  const { serviceProviderId } = filters;
  const include = [];
  delete filters.serviceProviderId;
  if (serviceProviderId) {
    include.push(
      {
        model: db.Service,
        attributes: [],
        required: true,
        where: { serviceProviderId },
      },
      {
        model: db.Payout,
      },
      {
        model: db.Dispute,
      }
    );
  }

  const orders = await db.Order.findAll({
    where: filters,
    raw: true,
    nest: true,

    include,
  });
  console.log(orders);
  if (!orders) throw new AppError(404, "Order not found");
  return orders;
}

async function checkoutServiceProviderOrder(orderId, transaction) {
  const filters = { id: orderId, status: "pending_completion" };
  const order = await orderRepository.getOrder(filters, transaction);
  const { id, amount, currency } = order;
  const payoutData = {
    orderId: id,
    amount,
    currency,
    status: "pending",
    amountToPay: Number(amount) * 0.8,
  };
  const payout = await orderRepository.createPayout(payoutData, transaction);
  return;
}
export async function serviceProviderCloseOrder({
  orderId,
  auth,
  transaction,
}) {
  const order = await orderRepository.getOrderForCheckoutPayouts({
    orderId,
    SPID: auth.relatedId,
    transaction,
  });
  //TODO
  // validate if its eligible to close (pending_completion)
  order.status = "pending_completion";
  await order.save();

  //this i will call now manually for testing
  await checkoutServiceProviderOrder(orderId, transaction);
}

export const orderService = {
  createOrder,
  getOrder,
  getOrders,
  getOrderByIdAndSPID,
  getServiceForPaymentPrivate,
  serviceProviderCloseOrder,
};
export default orderService;
