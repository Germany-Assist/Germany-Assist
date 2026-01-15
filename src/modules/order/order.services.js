import db from "../../database/index.js";
import { AppError } from "../../utils/error.class.js";
import hashIdUtil from "../../utils/hashId.util.js";
import stripeUtils from "../../utils/stripe.util.js";
import orderRepository from "./order.repository.js";
import { v4 as uuidv4 } from "uuid";
import ordersMapper from "./order.mapper.js";
export async function getOrdersForSP(SPId, filters) {
  const orders = await orderRepository.getOrdersForSP(SPId, filters);
  return { ...orders, data: ordersMapper.sanitizeOrders(orders.data) };
}
export async function payOrder(req) {
  const serviceId = hashIdUtil.hashIdDecode(req.query.serviceId);
  const optionId = hashIdUtil.hashIdDecode(req.query.optionId);
  const type = req.query.type;
  const service = await orderRepository.getServiceForPayment({
    serviceId,
    optionId,
    type,
  });

  const metadata = {
    serviceId,
    userId: req.auth.id,
    serviceProviderId: service.serviceProviderId,
    relatedType: type,
    relatedId: optionId,
  };
  const amount =
    type === "timeline" ? service.Timelines.price : service.Variants.price;
  // // in the future subscription may go here
  if (amount === 0) {
    //free service
    const orderData = {
      amount: 0,
      status: "active",
      userId: metadata.userId,
      serviceId: metadata.serviceId,
      serviceProviderId: service.serviceProviderId,
      relatedType: type,
      relatedId: optionId,
      stripePaymentIntentId: uuidv4(),
      currency: "usd",
    };
    await orderRepository.createOrder(orderData);
    return { clientSecret: null };
  } else {
    //paid service
    const pi = await stripeUtils.createPaymentIntent({ amount, metadata });
    return {
      clientSecret: pi.client_secret,
    };
  }
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
  getOrder,
  getOrders,
  getOrderByIdAndSPID,
  getOrdersForSP,
  serviceProviderCloseOrder,
  payOrder,
};
export default orderService;
