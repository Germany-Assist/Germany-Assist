import { raw, Router } from "express";
import db from "../database/dbIndex.js";
import jwtMiddleware from "../middlewares/jwt.middleware.js";
import { AppError } from "../utils/error.class.js";
import hashIdUtil from "../utils/hashId.util.js";
import { sequelize } from "../database/connection.js";
import Stripe from "stripe";
import { STRIPE_SK } from "../configs/serverConfig.js";
const ordersRouter = Router();

let stripe;
try {
  stripe = new Stripe(STRIPE_SK);
} catch (error) {
  errorLogger(error);
}
ordersRouter.post(
  "/checkout",
  jwtMiddleware.authenticateJwt,
  async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
      const { items } = req.body;
      const cartIds = items.map((i) => hashIdUtil.hashIdDecode(i));
      const cartItems = await db.User.findByPk(req.auth.id, {
        attributes: ["id"],
        include: [
          {
            model: db.Service,
            as: "services",
            include: {
              model: db.ServiceProvider,
              attributes: [
                ["id", "serviceProviderId"],
                ["name", "serviceProviderName"],
              ],
            },
            attributes: [["id", "serviceId"], "price", "title", "description"],
            through: { attributes: [], where: { id: cartIds, type: "cart" } },
          },
        ],
      });
      if (!cartItems || !cartItems.services || cartItems.services.length < 1)
        throw new AppError(400, "failed to process cart items");

      const order = await db.Order.create(
        {
          user_id: req.auth.id,
          status: "pending",
        },
        { transaction: t }
      );
      const orderItemsArray = cartItems.services.map((i) => {
        i = i.get({ plain: true });
        return {
          order_id: order.id,
          service_id: i.serviceId,
          title: i.title,
        };
      });

      const orderItems = await db.OrderItems.bulkCreate(orderItemsArray, {
        transaction: t,
      });
      function sanitizeOrder(order) {
        return {
          id: hashIdUtil.hashIdEncode(order.id),
          total_price: order.total_price,
          status: order.status,
        };
      }
      const sanitizedOrder = sanitizeOrder(order);
      //remove items from cart
      await db.UserService.destroy({
        where: { id: cartIds, user_id: cartItems.id, type: "cart" },
        transaction: t,
      });
      await t.commit();
      res.send(sanitizedOrder);
    } catch (err) {
      await t.rollback();
      next(err);
    }
  }
);
ordersRouter.post(
  "/pay",
  jwtMiddleware.authenticateJwt,
  async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
      const { id } = req.body;
      const orderId = hashIdUtil.hashIdDecode(id);
      // fetch the order
      const order = await db.Order.findByPk(orderId, {
        transaction: t,
        include: [
          {
            model: db.OrderItems,
            include: { model: db.Service, attributes: ["id", "price"] },
          },
        ],
      });
      if (!order) throw new AppError(404, "Order not found");

      function calculateTotalPrice(order) {
        const total_price = order.OrderItems.reduce(
          (total, item) => total + item.Service.price,
          0
        );
        return total_price;
      }
      function extractItems(order) {
        const items = order.OrderItems.map((item) => {
          return {
            item_id: item.id,
            item_price: item.Service.price,
            service_id: item.Service.id,
          };
        });
        return items;
      }
      const items = extractItems(order);
      function sanitizeOrder(order) {
        return {
          orderId: hashIdUtil.hashIdEncode(order.id),
          totalPrice: calculateTotalPrice(order),
          items: items.map((i) => {
            return {
              ...i,
              item_id: hashIdUtil.hashIdEncode(i.item_id),
              service_id: hashIdUtil.hashIdEncode(i.service_id),
            };
          }),
        };
      }
      if (order.status !== "pending")
        throw new AppError(400, "Order is not payable");

      const paymentIntent = await stripe.paymentIntents.create({
        amount: calculateTotalPrice(order) * 100,
        currency: "usd",
        metadata: {
          orderId: order.id,
          total_price: calculateTotalPrice(order),
          items: JSON.stringify(extractItems(order)),
        },
        automatic_payment_methods: { enabled: true, allow_redirects: "never" },
      });

      const payment = await db.Payment.create(
        {
          stripe_payment_intent_id: paymentIntent.id,
          amount: calculateTotalPrice(order),
          currency: "usd",
          status: "requires_payment",
          related_type: "service",
          related_id: order.id,
        },
        { transaction: t }
      );

      await t.commit();

      res.json({
        clientSecret: paymentIntent.client_secret,
        order: sanitizeOrder(order),
        paymentId: hashIdUtil.hashIdEncode(payment.id),
      });
    } catch (err) {
      await t.rollback();
      next(err);
    }
  }
);
export default ordersRouter;
