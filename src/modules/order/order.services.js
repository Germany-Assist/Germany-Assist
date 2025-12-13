import db from "../../database/index.js";
import { AppError } from "../../utils/error.class.js";

export async function createOrder(data, t) {
  return await db.Order.create(data, {
    raw: true,
    transaction: t,
  });
}
export async function getServiceForPaymentPrivate(id) {
  return await db.Service.findOne({
    raw: true,
    where: { id, published: true, approved: true, rejected: false },
    include: [
      { model: db.Timeline, where: { is_archived: false }, attributes: ["id"] },
    ],
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
        where: { service_provider_id: SPID },
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
  const { service_provider_id } = filters;
  const include = [];
  delete filters.service_provider_id;
  if (service_provider_id) {
    include.push({
      model: db.Service,
      attributes: [],
      required: true,
      where: { service_provider_id },
    });
  }
  const order = await db.Order.findAll({
    where: filters,
    raw: true,
    include,
  });
  if (!order) throw new AppError(404, "Order not found");
  return order;
}

export const orderService = {
  createOrder,
  getOrder,
  getOrders,
  getOrderByIdAndSPID,
  getServiceForPaymentPrivate,
};
export default orderService;
