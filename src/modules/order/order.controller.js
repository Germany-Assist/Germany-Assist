import orderService from "../order/order.services.js";
import hashIdUtil from "../../utils/hashId.util.js";
import stripeUtils from "../../utils/stripe.util.js";
import { AppError } from "../../utils/error.class.js";
import authUtil from "../../utils/authorize.util.js";
import userServices from "../user/user.services.js";

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
      `user ${(user.firstName_, user.firstName)} wants to buy service ${
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
      serviceProviderId: service.serviceProviderId,
      timelineId: service["Timelines.id"],
    };
    // in the future subscription may go here
    if (service.price === 0) {
      //free service
      const orderData = {
        amount: 0,
        status: "paid",
        userId: metadata.userId,
        serviceId: metadata.serviceId,
        timelineId: metadata.timelineId,
        stripePaymentIntentId: uuidv4(),
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
      userId: hashIdUtil.hashIdEncode(order.userId),
      timelineId: hashIdUtil.hashIdEncode(order.timelineId),
      serviceId: hashIdUtil.hashIdEncode(order.serviceId),
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
    const SPID = req.auth.relatedId;
    const order = await orderService.getOrderByIdAndSPID(filters, SPID);
    res.send({
      ...order,
      id: hashIdUtil.hashIdEncode(order.id),
      userId: hashIdUtil.hashIdEncode(order.userId),
      timelineId: hashIdUtil.hashIdEncode(order.timelineId),
      serviceId: hashIdUtil.hashIdEncode(order.user_iserviceId),
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
      userId: req.auth.id,
    };
    const order = await orderService.getOrder(filters);
    res.send({
      ...order,
      id: hashIdUtil.hashIdEncode(order.id),
      userId: hashIdUtil.hashIdEncode(order.userId),
      timelineId: hashIdUtil.hashIdEncode(order.timelineId),
      serviceId: hashIdUtil.hashIdEncode(order.user_iserviceId),
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
        userId: hashIdUtil.hashIdEncode(i.userId),
        timelineId: hashIdUtil.hashIdEncode(i.timelineId),
        serviceId: hashIdUtil.hashIdEncode(i.user_iserviceId),
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
      serviceProviderId: req.auth.relatedId,
    };
    const orders = await orderService.getOrders(filters);
    const sanitizedOrders = orders.map((i) => {
      return {
        ...i,
        id: hashIdUtil.hashIdEncode(i.id),
        userId: hashIdUtil.hashIdEncode(i.userId),
        timelineId: hashIdUtil.hashIdEncode(i.timelineId),
        serviceId: hashIdUtil.hashIdEncode(i.user_iserviceId),
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
      userId: req.auth.id,
    };
    const orders = await orderService.getOrders(filters);
    const sanitizedOrders = orders.map((i) => {
      return {
        ...i,
        id: hashIdUtil.hashIdEncode(i.id),
        userId: hashIdUtil.hashIdEncode(i.userId),
        timelineId: hashIdUtil.hashIdEncode(i.timelineId),
        serviceId: hashIdUtil.hashIdEncode(i.user_iserviceId),
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
