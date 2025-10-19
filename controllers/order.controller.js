import { sequelize } from "../database/connection.js";
import orderService from "../services/order.services.js";
import hashIdUtil from "../utils/hashId.util.js";
import stripeUtils from "../utils/stripe.util.js";
import paymentServices from "../services/payment.service.js";
import { AppError } from "../utils/error.class.js";
import authUtil from "../utils/authorize.util.js";
import inquiryServices from "../services/inquiry.services.js";
import categoryController from "./category.controller.js";

export async function checkoutController(req, res, next) {
  const t = await sequelize.transaction();
  try {
    await authUtil.checkRoleAndPermission(req.auth, ["client"], false);
    const { id } = req.params;
    const orderId = hashIdUtil.hashIdDecode(id);
    const userId = req.auth.id;
    const order = await orderService.getOrderCheckout(orderId, userId);
    if (order.status !== "pending client approval")
      throw new AppError(
        400,
        "Order is not payable",
        true,
        "Order is not payable"
      );
    const metadata = {
      orderId: orderId,
    };

    const paymentIntent = await stripeUtils.createPaymentIntent(
      order.amount,
      metadata
    );

    const payment = await paymentServices.createPayment(
      paymentIntent.id,
      Math.round(order.amount * 100),
      order.id,
      t
    );

    const inquiryUpdate = {
      status: "checked out",
    };
    const inquiryFilter = {
      order_id: orderId,
    };

    await inquiryServices.updateInquiry(inquiryFilter, inquiryUpdate, t);
    res.json({
      clientSecret: paymentIntent.client_secret,
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
    const { id } = req.params;
    const inquiryId = hashIdUtil.hashIdDecode(id);
    await authUtil.checkRoleAndPermission(
      req.auth,
      ["service_provider_rep", "service_provider_root"],
      true,
      "offer",
      "create"
    );
    await authUtil.checkOwnership(id, req.auth.related_id, "inquiry");
    const offer = await orderService.generateOffer(
      req.auth.related_id,
      inquiryId
    );
    const main = await offer.get({ plain: true });
    const variables = main.Service.Category.variables;
    const contract = categoryController.initContract(main);
    res.send({ contract, variables });
  } catch (err) {
    next(err);
  }
}
export async function createOrder(req, res, next) {
  const t = await sequelize.transaction();
  try {
    const customerData = req.body;
    const inquiryId = hashIdUtil.hashIdDecode(customerData.id);
    await authUtil.checkRoleAndPermission(req.auth, [
      "service_provider_rep",
      "service_provider_root",
      true,
      "order",
      "create",
    ]);
    await authUtil.checkOwnership(
      customerData.id,
      req.auth.related_id,
      "inquiry"
    );

    const offer = await orderService.generateOffer(
      req.auth.related_id,
      inquiryId,
      t
    );
    let existingOrder;
    if (offer.order_id)
      existingOrder = await orderService.getOrder({ id: offer.order_id });
    if (existingOrder && existingOrder.status === "pending client approval")
      throw new AppError(
        409,
        "order already exists",
        true,
        `order already exists please cancel the order with id ${hashIdUtil.hashIdEncode(
          existingOrder.id
        )} first`
      );

    const main = await offer.get({ plain: true });
    const variables = main.Service.Category.variables;
    const preContract = categoryController.initContract(main);
    const data = {};
    variables.forEach((i) => {
      if (customerData[i]) {
        data[i] = customerData[i];
      }
    });
    const contract = categoryController.fillContract(preContract, data);
    const orderData = {
      contract,
      amount: data.price,
      status: "pending client approval",
      user_id: main.User.id,
      service_provider_id: main.Service.ServiceProvider.id,
      variables: data,
    };
    const order = await orderService.createOrder(orderData, t);
    const inquiryUpdate = {
      order_id: order.id,
      status: "pending client approval",
    };
    const inquiryFilter = {
      id: inquiryId,
    };
    await inquiryServices.updateInquiry(inquiryFilter, inquiryUpdate, t);
    res.sendStatus(201);
    await t.commit();
  } catch (err) {
    await t.rollback();
    next(err);
  }
}

export async function getOrderAdmin(req, res, next) {
  try {
    await authUtil.checkRoleAndPermission(req.auth, ["admin"]);
    const filters = {
      id: hashIdUtil.hashIdDecode(req.params.id),
    };
    const order = await orderService.getOrder(filters);
    console.log(order);
    res.send({
      ...order,
      id: hashIdUtil.hashIdEncode(order.id),
      user_id: hashIdUtil.hashIdEncode(order.user_id),
    });
  } catch (err) {
    next(err);
  }
}
export async function getOrderSP(req, res, next) {
  try {
    await authUtil.checkRoleAndPermission(req.auth, [
      "service_provider_rep",
      "service_provider_root",
    ]);
    const filters = {
      id: hashIdUtil.hashIdDecode(req.params.id),
      service_provider_id: req.auth.related_id,
    };
    const order = await orderService.getOrder(filters);
    res.send({
      ...order,
      id: hashIdUtil.hashIdEncode(order.id),
      user_id: hashIdUtil.hashIdEncode(order.user_id),
    });
  } catch (err) {
    next(err);
  }
}
export async function getOrderCL(req, res, next) {
  try {
    await authUtil.checkRoleAndPermission(req.auth, ["client"]);
    const filters = {
      id: hashIdUtil.hashIdDecode(req.params.id),
      user_id: req.auth.id,
    };
    const order = await orderService.getOrder(filters);
    res.send({
      ...order,
      id: hashIdUtil.hashIdEncode(order.id),
      user_id: hashIdUtil.hashIdEncode(order.user_id),
    });
  } catch (err) {
    next(err);
  }
}
export async function getOrdersAdmin(req, res, next) {
  try {
    await authUtil.checkRoleAndPermission(req.auth, ["admin"]);
    const filters = {
      ...req.query,
    };
    const orders = await orderService.getOrders(filters);
    const sanitizedOrders = orders.map((i) => {
      return {
        ...i,
        id: hashIdUtil.hashIdEncode(i.id),
        user_id: hashIdUtil.hashIdEncode(i.user_id),
      };
    });
    res.send(sanitizedOrders);
  } catch (err) {
    next(err);
  }
}
export async function getOrdersSP(req, res, next) {
  try {
    await authUtil.checkRoleAndPermission(req.auth, [
      "service_provider_rep",
      "service_provider_root",
    ]);
    const filters = {
      ...req.query,
      service_provider_id: req.auth.related_id,
    };
    const orders = await orderService.getOrders(filters);
    const sanitizedOrders = orders.map((i) => {
      return {
        ...i,
        id: hashIdUtil.hashIdEncode(i.id),
        user_id: hashIdUtil.hashIdEncode(i.user_id),
      };
    });
    res.send(sanitizedOrders);
  } catch (err) {
    next(err);
  }
}
export async function getOrdersCL(req, res, next) {
  try {
    await authUtil.checkRoleAndPermission(req.auth, ["client"]);
    const filters = {
      ...req.query,
      user_id: req.auth.id,
    };
    const orders = await orderService.getOrders(filters);
    const sanitizedOrders = orders.map((i) => {
      return {
        ...i,
        id: hashIdUtil.hashIdEncode(i.id),
        user_id: hashIdUtil.hashIdEncode(i.user_id),
      };
    });
    res.send(sanitizedOrders);
  } catch (err) {
    next(err);
  }
}
export async function cancelOrderSP(req, res, next) {
  try {
    await authUtil.checkRoleAndPermission(req.auth, [
      "service_provider_rep",
      "service_provider_root",
    ]);
    const filters = {
      id: hashIdUtil.hashIdDecode(req.params.id),
      service_provider_id: req.auth.related_id,
      status: "pending client approval",
    };
    await orderService.alterOrderState("cancelled", filters);
    res.sendStatus(200);
  } catch (err) {
    next(err);
  }
}
export async function cancelOrderCL(req, res, next) {
  try {
    await authUtil.checkRoleAndPermission(req.auth, ["client"], false);
    const filters = {
      id: hashIdUtil.hashIdDecode(req.params.id),
      user_id: req.auth.id,
      status: "pending client approval",
    };
    await orderService.alterOrderState("cancelled", filters);
    res.sendStatus(200);
  } catch (err) {
    next(err);
  }
}
const orderController = {
  checkoutController,
  generateOffer,
  createOrder,
  getOrderAdmin,
  getOrderSP,
  getOrderCL,
  getOrdersAdmin,
  getOrdersSP,
  getOrdersCL,
  cancelOrderSP,
  cancelOrderCL,
};

export default orderController;
