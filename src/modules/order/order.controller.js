import orderService from "../order/order.services.js";
import hashIdUtil from "../../utils/hashId.util.js";
import authUtil from "../../utils/authorize.util.js";
import { sequelize } from "../../configs/database.js";

export async function payOrder(req, res, next) {
  try {
    await authUtil.checkRoleAndPermission(req.auth, ["client"], false);
    const message = await orderService.payOrder(req);
    res.send({
      success: true,
      message,
    });
  } catch (error) {
    next(error);
  }
}

// export async function getOrderAdmin(req, res, next) {
//   try {
//     await authUtil.checkRoleAndPermission(req.auth, ["admin"]);
//     const filters = {
//       id: hashIdUtil.hashIdDecode(req.params.id),
//     };
//     const order = await orderService.getOrder(filters);
//     res.send({
//       ...order,
//       id: hashIdUtil.hashIdEncode(order.id),
//       userId: hashIdUtil.hashIdEncode(order.userId),
//       timelineId: hashIdUtil.hashIdEncode(order.timelineId),
//       serviceId: hashIdUtil.hashIdEncode(order.serviceId),
//     });
//   } catch (err) {
//     next(err);
//   }
// }
// export async function getOrderSP(req, res, next) {
//   try {
//     await authUtil.checkRoleAndPermission(req.auth, [
//       "service_provider_rep",
//       "service_provider_root",
//     ]);
//     const filters = {
//       id: hashIdUtil.hashIdDecode(req.params.id),
//     };
//     const SPID = req.auth.relatedId;
//     const order = await orderService.getOrderByIdAndSPID(filters, SPID);
//     res.send({
//       ...order,
//       id: hashIdUtil.hashIdEncode(order.id),
//       userId: hashIdUtil.hashIdEncode(order.userId),
//       timelineId: hashIdUtil.hashIdEncode(order.timelineId),
//       serviceId: hashIdUtil.hashIdEncode(order.user_iserviceId),
//     });
//   } catch (err) {
//     next(err);
//   }
// }
// export async function getOrderCL(req, res, next) {
//   try {
//     await authUtil.checkRoleAndPermission(req.auth, ["client"]);
//     const filters = {
//       id: hashIdUtil.hashIdDecode(req.params.id),
//       userId: req.auth.id,
//     };
//     const order = await orderService.getOrder(filters);
//     res.send({
//       ...order,
//       id: hashIdUtil.hashIdEncode(order.id),
//       userId: hashIdUtil.hashIdEncode(order.userId),
//       timelineId: hashIdUtil.hashIdEncode(order.timelineId),
//       serviceId: hashIdUtil.hashIdEncode(order.user_iserviceId),
//     });
//   } catch (err) {
//     next(err);
//   }
// }
// export async function getOrdersAdmin(req, res, next) {
//   try {
//     await authUtil.checkRoleAndPermission(req.auth, ["admin"]);
//     const filters = {
//       ...req.query,
//     };
//     const orders = await orderService.getOrders(filters);
//     const sanitizedOrders = orders.map((i) => {
//       return {
//         ...i,
//         id: hashIdUtil.hashIdEncode(i.id),
//         userId: hashIdUtil.hashIdEncode(i.userId),
//         timelineId: hashIdUtil.hashIdEncode(i.timelineId),
//         serviceId: hashIdUtil.hashIdEncode(i.user_iserviceId),
//       };
//     });
//     res.send(sanitizedOrders);
//   } catch (err) {
//     next(err);
//   }
// }
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
        relatedId: hashIdUtil.hashIdEncode(i.relatedId),
        serviceId: hashIdUtil.hashIdEncode(i.serviceId),
      };
    });
    res.send(sanitizedOrders);
  } catch (err) {
    next(err);
  }
}
// export async function getOrdersCL(req, res, next) {
//   try {
//     await authUtil.checkRoleAndPermission(req.auth, ["client"]);
//     const filters = {
//       ...req.query,
//       userId: req.auth.id,
//     };
//     const orders = await orderService.getOrders(filters);
//     const sanitizedOrders = orders.map((i) => {
//       return {
//         ...i,
//         id: hashIdUtil.hashIdEncode(i.id),
//         userId: hashIdUtil.hashIdEncode(i.userId),
//         timelineId: hashIdUtil.hashIdEncode(i.timelineId),
//         serviceId: hashIdUtil.hashIdEncode(i.user_iserviceId),
//       };
//     });
//     res.send(sanitizedOrders);
//   } catch (err) {
//     next(err);
//   }
// }

export async function serviceProviderCloseOrder(req, res, next) {
  const transaction = await sequelize.transaction();
  try {
    const { orderId } = req.params;
    await orderService.serviceProviderCloseOrder({
      orderId: hashIdUtil.hashIdDecode(orderId),
      auth: req.auth,
      transaction,
    });
    await transaction.commit();
    res.send({ success: true, message: "your order was moved to payouts" });
  } catch (err) {
    await transaction.rollback();
    next(err);
  }
}
const orderController = {
  serviceProviderCloseOrder,
  payOrder,
  // getOrderAdmin,
  // getOrderSP,
  // getOrderCL,
  // getOrdersAdmin,
  getOrdersSP,
  // getOrdersCL,
};

export default orderController;
