import { sequelize } from "../database/connection.js";
import orderService from "../services/order.services.js";
import hashIdUtil from "../utils/hashId.util.js";
import stripeUtils from "../utils/stripe.util.js";
import { AppError } from "../utils/error.class.js";
import authUtil from "../utils/authorize.util.js";
import userServices from "../services/user.services.js";
import serviceServices from "../services/service.services.js";
import { v4 as uuidv4 } from "uuid";
export async function checkoutController(req, res, next) {
  try {
    await authUtil.checkRoleAndPermission(req.auth, ["client"], false);
    const { id } = req.params;
    const serviceId = hashIdUtil.hashIdDecode(id);
    const user = await userServices.getUserById(req.auth.id);
    const service = await orderService.getServiceForPaymentPrivate(serviceId);
    if (!user || !service)
      throw new AppError(404, "failed to find user or service", false);
    res.send(
      `user ${(user.first_name_, user.first_name)} wants to buy service ${
        service.title
      } for price of "${service.price}"`
    );
  } catch (err) {
    next(err);
  }
}
export async function payOrder(req, res, next) {
  try {
    await authUtil.checkRoleAndPermission(req.auth, ["client"], false);
    const { id } = req.params;
    const serviceId = hashIdUtil.hashIdDecode(id);
    const service = await orderService.getServiceForPaymentPrivate(serviceId);
    const metadata = {
      serviceId,
      userId: req.auth.id,
      timelineId: service["Timelines.id"],
    };
    // in the future subscription may go here
    if (service.price === 0) {
      //free service
      const orderData = {
        amount: 0,
        status: "paid",
        user_id: metadata.userId,
        service_id: metadata.serviceId,
        timeline_id: metadata.timelineId,
        stripe_payment_intent_id: uuidv4(),
        currency: "usd",
      };
      await orderService.createOrder(orderData);
      res.send({ success: true, message: { clientSecret: null } });
    } else {
      //paid service
      const pi = await stripeUtils.createPaymentIntent(service.price, metadata);
      res.send({
        success: true,
        message: { clientSecret: pi.client_secret },
      });
    }
  } catch (error) {
    next(error);
  }
}

export async function getOrderAdmin(req, res, next) {
  try {
    await authUtil.checkRoleAndPermission(req.auth, ["admin"]);
    const filters = {
      id: hashIdUtil.hashIdDecode(req.params.id),
    };
    const order = await orderService.getOrder(filters);
    res.send({
      ...order,
      id: hashIdUtil.hashIdEncode(order.id),
      user_id: hashIdUtil.hashIdEncode(order.user_id),
      timeline_id: hashIdUtil.hashIdEncode(order.timeline_id),
      service_id: hashIdUtil.hashIdEncode(order.service_id),
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
    };
    const SPID = req.auth.related_id;
    const order = await orderService.getOrderByIdAndSPID(filters, SPID);
    res.send({
      ...order,
      id: hashIdUtil.hashIdEncode(order.id),
      user_id: hashIdUtil.hashIdEncode(order.user_id),
      timeline_id: hashIdUtil.hashIdEncode(order.timeline_id),
      service_id: hashIdUtil.hashIdEncode(order.user_iservice_id),
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
      timeline_id: hashIdUtil.hashIdEncode(order.timeline_id),
      service_id: hashIdUtil.hashIdEncode(order.user_iservice_id),
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
        timeline_id: hashIdUtil.hashIdEncode(i.timeline_id),
        service_id: hashIdUtil.hashIdEncode(i.user_iservice_id),
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
        timeline_id: hashIdUtil.hashIdEncode(i.timeline_id),
        service_id: hashIdUtil.hashIdEncode(i.user_iservice_id),
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
        timeline_id: hashIdUtil.hashIdEncode(i.timeline_id),
        service_id: hashIdUtil.hashIdEncode(i.user_iservice_id),
      };
    });
    res.send(sanitizedOrders);
  } catch (err) {
    next(err);
  }
}

const orderController = {
  checkoutController,
  payOrder,
  getOrderAdmin,
  getOrderSP,
  getOrderCL,
  getOrdersAdmin,
  getOrdersSP,
  getOrdersCL,
};

export default orderController;
