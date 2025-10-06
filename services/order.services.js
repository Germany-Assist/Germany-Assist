import { Op } from "sequelize";
import db from "../database/dbIndex.js";
import { AppError } from "../utils/error.class.js";

export async function createOrder(user_id, serviceIds, t) {
  return await db.Order.create(
    {
      user_id,
      status: "pending",
      OrderItems: serviceIds,
    },

    {
      raw: true,
      transaction: t,
      include: {
        model: db.OrderItems,
      },
    }
  );
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
export async function getOrderById(orderId) {
  const order = await db.Order.findByPk(orderId, {
    include: [
      {
        model: db.OrderItems,
        include: { model: db.Service, attributes: ["id", "price"] },
      },
    ],
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
  createOrderItems,
  getOrderById,
  updateOrder,
};
export default orderService;
