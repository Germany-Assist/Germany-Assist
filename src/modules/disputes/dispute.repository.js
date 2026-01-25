import db from "../../database/index.js";

export function create(data) {
  return db.Dispute.create(data);
}

export function findById(id) {
  return db.Dispute.findByPk(id);
}

export async function findAllPaginated({ page = 1, limit = 20, filters }) {
  const offset = (page - 1) * limit;
  const where = {};

  if (filters.status) where.status = filters.status;
  if (filters.openedBy) where.openedBy = filters.openedBy;
  if (filters.orderId) where.orderId = filters.orderId;

  const { rows, count } = await db.Dispute.findAndCountAll({
    where,
    limit: Number(limit),
    offset,
    order: [["createdAt", "DESC"]],
  });

  return {
    rows,
    meta: {
      total: count,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(count / limit),
    },
  };
}

const disputeRepository = {
  create,
  findById,
  findAllPaginated,
};

export default disputeRepository;
