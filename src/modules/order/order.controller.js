import orderService, { getOrdersForSP } from "../order/order.services.js";
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

export async function getOrdersSP(req, res, next) {
  try {
    await authUtil.checkRoleAndPermission(req.auth, [
      "service_provider_rep",
      "service_provider_root",
    ]);
    const orders = await getOrdersForSP(req.auth.relatedId, req.query);
    res.send(orders);
  } catch (err) {
    next(err);
  }
}

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
    res.send({
      success: true,
      message: "The Order was closed successfully 7 days for the escrow window",
    });
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
