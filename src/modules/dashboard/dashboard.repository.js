import { Op } from "sequelize";
import db from "../../database/index.js";

export async function grossTotalForSP(SPId) {
  return await db.Order.sum("amount", {
    where: {
      status: ["active", "pending_completion", "completed"],
      serviceProviderId: SPId,
    },
  });
}
export async function escrowForSP(SPId) {
  return await db.Order.sum("amount", {
    where: {
      status: ["pending_completion"],
      serviceProviderId: SPId,
    },
  });
}
export async function balanceForSP(SPId) {
  return await db.Order.sum("amount", {
    where: {
      status: ["completed"],
      serviceProviderId: SPId,
    },
  });
}
export async function disputesForSP(SPId) {
  return await db.Order.count({
    where: {
      status: ["completed"],
      serviceProviderId: SPId,
    },
    include: [
      {
        model: db.Dispute,
        where: { status: { [Op.in]: ["open", "in_review"] } },
        require: true,
        attributes: [],
      },
    ],
  });
}
const dashboardRepository = {
  grossTotalForSP,
  disputesForSP,
  balanceForSP,
  escrowForSP,
};
export default dashboardRepository;
