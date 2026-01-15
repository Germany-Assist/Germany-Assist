import db from "../../database/index.js";
import { AppError } from "../../utils/error.class.js";
import { Op } from "sequelize";

export async function getOrdersForSP(SPId, filters = {}) {
  // pagination (safe & predictable)
  const page = Math.max(Number(filters.page) || 1, 1);
  const limit = Math.min(Number(filters.limit) || 20, 100);
  const offset = (page - 1) * limit;
  // base order filters
  const where = {
    serviceProviderId: SPId,
  };
  // order status filter
  if (filters.status) {
    where.status = filters.status;
  } else {
    where.status = ["active", "pending_completion", "completed"];
  }
  // optional order filters
  if (filters.type) {
    where.relatedType = filters.type;
  }
  if (filters.serviceId) {
    where.serviceId = filters.serviceId;
  }
  // ALWAYS include dispute info (1-to-1)
  const include = [
    {
      model: db.Dispute,
      required: false, // LEFT JOIN
    },
    {
      model: db.Payout,
      required: false,
    },
  ];
  // filter: only disputed orders
  if (filters.onlyDisputed) {
    where["$Dispute.id$"] = { [Op.ne]: null };
  }
  // filter: specific dispute status
  if (filters.disputeStatus) {
    where["$Dispute.status$"] = filters.disputeStatus;
  }
  const { rows, count } = await db.Order.findAndCountAll({
    where,
    include,
    limit,
    offset,
    order: [["createdAt", "DESC"]],
  });

  return {
    data: rows,
    meta: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
    },
  };
}

export async function getServiceForPayment({ serviceId, optionId, type }) {
  const include = [];
  if (type === "oneTime") {
    include.push({
      model: db.Variant,
      where: { id: optionId },
      required: true,
    });
  } else if (type === "timeline") {
    include.push({
      model: db.Timeline,
      where: { id: optionId },
      required: true,
    });
  }
  const service = await db.Service.findOne({
    raw: true,
    nest: true,
    where: { id: serviceId, published: true, approved: true, rejected: false },
    include,
  });
  if (!service) throw new AppError(500, "failed to find service", false);
  return service;
}

export async function createOrder(data, t) {
  return await db.Order.create(data, {
    raw: true,
    transaction: t,
  });
}

export async function createPayout(payoutData, transaction) {
  await db.Payout.create(payoutData, { transaction });
}

export async function serviceProviderCloseOrder({
  orderId,
  SPID,
  transaction,
}) {
  return await db.Order.update(
    { status: "pending_completion" },
    {
      where: { id: orderId, status: "active" },
      raw: true,
      include: [
        {
          model: db.Service,
          where: { serviceProviderId: SPID },
          attributes: [],
          required: true,
        },
      ],
      transaction,
    }
  );
}
export async function getOrder(filters) {
  const order = await db.Order.findOne({
    where: filters,
    raw: true,
    nest: true,
  });
  if (!order)
    throw new AppError(404, "Order not found", true, "Order not found");
  return order;
}
const orderRepository = {
  serviceProviderCloseOrder,
  getOrder,
  createPayout,
  getOrdersForSP,
  getServiceForPayment,
  createOrder,
};
export default orderRepository;
