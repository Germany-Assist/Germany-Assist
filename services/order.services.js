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
export async function createOrderItems(orderItems, t) {
  return await db.OrderItems.bulkCreate(orderItems, {
    transaction: t,
  });
}

export async function getOrderById(orderId, clientId) {
  const order = await db.Order.findOne({
    where: { id: orderId, user_id: clientId },
  });
  if (!order) throw new AppError(404, "Order not found");
  return order;
}
// this can be merged with the above but was separated to reduce the traffic and enhance speed
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
export async function generateOffer(SPId, inquiryId) {
  const offer = await db.Inquiry.findOne({
    where: { id: inquiryId },
    include: [
      {
        model: db.Service,
        where: { service_provider_id: SPId },
        attributes: ["id", "title", "price", "service_provider_id"],
        required: true,
        include: [
          {
            model: db.Category,
            required: true,
            attributes: ["id", "contract_template", "variables", "title"],
          },
          {
            model: db.ServiceProvider,
            attributes: ["id", "name", "email", "phone_number"],
          },
        ],
      },
      {
        model: db.User,
        attributes: ["first_name", "last_name", "email", "id"],
      },
    ],
  });
  return offer;
}
export const orderService = {
  createOrder,
  getUserCartByIds,
  createOrderItems,
  getOrderById,
  updateOrder,
  generateOffer,
  getOrderCheckout,
};
export default orderService;
