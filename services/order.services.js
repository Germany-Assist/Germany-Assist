import { Op } from "sequelize";
import db from "../database/dbIndex.js";
import { AppError } from "../utils/error.class.js";

export async function createOrder(data, t) {
  return await db.Order.create(data, {
    raw: true,
    transaction: t,
  });
}
export async function getUserCartByIds(userId, cartIds) {
  const cartItems = await db.User.findByPk(userId, {
    attributes: ["id"],
    include: [
      {
        model: db.Service,
        as: "userCart",
        attributes: ["id", "price"],
        through: { attributes: [], where: { id: cartIds } },
      },
    ],
  });
  if (!cartItems || !cartItems.userCart || cartItems.userCart.length < 1)
    throw new AppError(400, "failed to process cart items");
  return cartItems.userCart;
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
  const order = await db.Order.findAll({
    where: filters,
    raw: true,
  });
  if (!order) throw new AppError(404, "Order not found");
  return order;
}
export async function alterOrderState(status, filters) {
  const order = await db.Order.update({ status }, { where: filters });
}
export async function getOrderCheckout(orderId, clientId) {
  const order = await db.Order.findOne({
    attributes: ["id", "variables", "status", "amount"],
    where: { id: orderId, user_id: clientId },
    raw: true,
  });
  if (!order) throw new AppError(404, "Order not found");
  return order;
}
export async function updateOrder(status, amount, id, t) {
  return await db.Order.update(
    { status, amount: amount / 100 },
    {
      where: {
        id,
        status: { [Op.ne]: status },
      },
      transaction: t,
    }
  );
}

export const orderService = {
  createOrder,
  getUserCartByIds,
  getOrder,
  getOrders,
  getOrderByIdAndSPID,
  updateOrder,
  getOrderCheckout,
  alterOrderState,
};
export default orderService;
