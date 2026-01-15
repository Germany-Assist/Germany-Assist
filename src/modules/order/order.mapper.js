import hashIdUtil from "../../utils/hashId.util.js";

export function sanitizeOrders(orders) {
  return orders.map((order) => {
    if (order.Payout) {
      return {
        type: "payout",
        orderId: hashIdUtil.hashIdEncode(order.id),
        payoutId: hashIdUtil.hashIdEncode(order.Payout.id),
        serviceId: hashIdUtil.hashIdEncode(order.serviceId),
        serviceType: order.relatedType,
        relatedId: hashIdUtil.hashIdEncode(order.relatedId),
        buyerId: hashIdUtil.hashIdEncode(order.userId),
        amount: parseFloat(order.Payout.amount) / 100,
        amountToPay: order.Payout.amountToPay
          ? parseFloat(order.Payout.amountToPay) / 100
          : null,
        status: order.Payout.status,
        currency: order.Payout.currency,
        createdAt: order.Payout.createdAt,
        updatedAt: order.Payout.updatedAt,
        dispute: null,
      };
    } else {
      return {
        type: "order",
        orderId: hashIdUtil.hashIdEncode(order.id),
        serviceId: hashIdUtil.hashIdEncode(order.serviceId),
        serviceType: order.relatedType,
        relatedId: hashIdUtil.hashIdEncode(order.relatedId),
        buyerId: hashIdUtil.hashIdEncode(order.userId),
        amount: parseFloat(order.amount) / 100,
        status: order.status,
        currency: order.currency,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        dispute: order.Dispute
          ? {
              id: hashIdUtil.hashIdEncode(order.Dispute.id),
              openedBy: order.Dispute.openedBy,
              reason: order.Dispute.reason,
              status: order.Dispute.status,
              resolution: order.Dispute.resolution || null,
              createdAt: order.Dispute.createdAt,
              updatedAt: order.Dispute.updatedAt,
            }
          : null,
      };
    }
  });
}

const ordersMapper = { sanitizeOrders };
export default ordersMapper;
