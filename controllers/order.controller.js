import { sequelize } from "../database/connection.js";
import orderService from "../services/order.services.js";
import serviceServices from "../services/service.services.js";
import hashIdUtil from "../utils/hashId.util.js";
import stripeUtils from "../utils/stripe.util.js";
import paymentServices from "../services/payment.service.js";
import { AppError } from "../utils/error.class.js";
import authUtil from "../utils/authorize.util.js";
import mustache from "mustache";
//-------------------------just helpers--------------------//
export function generateOrderItems(orderId, services) {
  const orderItemsArray = services.map((i) => {
    i = i.get({ plain: true });
    return {
      order_id: orderId,
      service_id: i.id,
      title: i.title,
    };
  });
  return orderItemsArray;
}
function calculateOrderPrice(orderItems) {
  const total_price = orderItems.reduce(
    (total, item) => total + item.Service.price,
    0
  );
  return total_price;
}
export function extractItems(order) {
  const items = order.OrderItems.map((item) => {
    return {
      item_id: item.id,
      item_price: item.Service.price,
      service_id: item.Service.id,
    };
  });
  return items;
}
export function sanitizeOrder(order, cost = false) {
  return {
    orderId: hashIdUtil.hashIdEncode(order.id),
    ...(cost && {
      totalAmount: calculateOrderPrice(order.OrderItems),
    }),
    items: order.OrderItems.map((i) => {
      return {
        item_id: hashIdUtil.hashIdEncode(i.id),
        service_id: hashIdUtil.hashIdEncode(i.service_id),
        ...(cost && {
          price: i.Service.price,
        }),
      };
    }),
  };
}
//-------------------------end helpers--------------------//

export async function checkoutController(req, res, next) {
  const t = await sequelize.transaction();
  try {
    const { items } = req.body;
    const cartIds = items.map((i) => hashIdUtil.hashIdDecode(i));
    const userId = req.auth.id;
    const cartItems = await orderService.getUserCartByIds(userId, cartIds);
    const servicesIds = cartItems.map((i) => {
      return { service_id: i.id };
    });
    const order = await orderService.createOrder(userId, servicesIds, t);
    const sanitizedOrder = sanitizeOrder(order);
    // await serviceServices.removeItemsFromCart(userId, cartIds);
    await t.commit();
    res.send(sanitizedOrder);
  } catch (err) {
    await t.rollback();
    next(err);
  }
}

export async function payController(req, res, next) {
  const t = await sequelize.transaction();
  try {
    const { id } = req.body;
    const orderId = hashIdUtil.hashIdDecode(id);
    const order = await orderService.getOrderById(orderId);
    if (order.status !== "pending")
      throw new AppError(400, "Order is not payable");
    const totalAmount = calculateOrderPrice(order.OrderItems);
    const items = extractItems(order);
    const paymentIntent = await stripeUtils.createPaymentIntent(
      order,
      items,
      totalAmount
    );
    const payment = await paymentServices.createPayment(
      paymentIntent.id,
      Math.round(totalAmount),
      order.id,
      t
    );
    res.json({
      clientSecret: paymentIntent.client_secret,
      order: sanitizeOrder(order, true),
      paymentId: hashIdUtil.hashIdEncode(payment.id),
    });
    await t.commit();
  } catch (err) {
    await t.rollback();
    next(err);
  }
}

export async function generateOffer(req, res, next) {
  try {
    authUtil.checkRoleAndPermission(req.auth, [
      "service_provider_rep",
      "service_provider_root",
    ]);
    const { id } = req.params;
    const inquiryId = hashIdUtil.hashIdDecode(id);
    const offer = await orderService.generateOffer(
      req.auth.related_id,
      inquiryId
    );
    const main = await offer.get({ plain: true });
    const user = main.User;
    const service = main.Service;
    const contract = service.categories[0].Contract;
    const fixed_variables = contract.fixed_variables;
    const serviceProvider = service.ServiceProvider;
    const template = contract.contract_template;
    console.log(fixed_variables);
    const data = { client_name: "amr", agency_name: "germany-assist" };
    function render(template, data) {
      return template.replace(/{{([^{}]+)}}/g, (_, key) => {
        const value = data?.[key];
        return value ?? `{{${key}}}`;
      });
    }
    const preFiledTemplate = render(template, data);
    res.send(preFiledTemplate);
  } catch (err) {
    next(err);
  }
}
export async function createOrder(req, res, next) {
  try {
    //first we need the inquiry id and the variables
    //we extract the template contract and fill the variables back and front
    //we print the contract
    const { id } = req.params;
    const inquiryId = hashIdUtil.hashIdDecode(id);
    console.log("hello");
    //   authUtil.checkRoleAndPermission(req.auth, [
    //     "service_provider_rep",
    //     "service_provider_root",
    //   ]);
    //   const { id } = req.params;
    //   const inquiryId = hashIdUtil.hashIdDecode(id);
    //   const offer = await orderService.generateOffer(
    //     req.auth.related_id,
    //     inquiryId
    //   );
    //   res.send(offer);
  } catch (err) {
    next(err);
  }
}

const orderController = {
  checkoutController,
  payController,
  generateOffer,
  createOrder,
};

export default orderController;
//  get orderById
//  get my orders
//  get orders for admins
//  get orders by id for admins
