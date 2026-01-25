import hashIdUtil from "../../utils/hashId.util.js";
import disputeRepository from "./dispute.repository.js";

export async function openDispute(data, user) {
  const { orderId, description, reason } = data;
  return disputeRepository.create({
    orderId: data.orderId,
    openedBy: user.role === "admin" ? "system" : "buyer",
    reason: data.reason,
    description: data.description,
  });
}

export async function listDisputesProvider(query, auth) {
  const filters = {
    status: query.status,
    orderId: hashIdUtil.hashIdDecode(query.orderId),
    userId: hashIdUtil.hashIdDecode(query.userId),
    status: query.status,
    resolution: query.resolution,
    serviceProviderId: auth.relatedId,
  };
  return disputeRepository.findAllPaginated({
    page: query.page,
    limit: query.limit,
    filters,
  });
}
export async function listDisputesClient(query, auth) {
  const filters = {
    status: query.status,
    orderId: hashIdUtil.hashIdDecode(query.orderId),
    status: query.status,
    resolution: query.resolution,
    serviceProviderId: query.serviceProviderId,
    userId: auth.id,
  };
  return disputeRepository.findAllPaginated({
    page: query.page,
    limit: query.limit,
    filters,
  });
}
export async function listDisputesAdmin(query) {
  const filters = {
    status: query.status,
    orderId: hashIdUtil.hashIdDecode(query.orderId),
    status: query.status,
    resolution: query.resolution,
    serviceProviderId: query.serviceProviderId,
    userId: hashIdUtil.hashIdDecode(query.userId),
  };

  return disputeRepository.findAllPaginated({
    page: query.page,
    limit: query.limit,
    filters,
  });
}
export async function getDisputeById(id, user) {
  const dispute = await disputeRepository.findById(id);
  if (!dispute) throw new Error("Dispute not found");

  if (user.role !== "admin" && dispute.openedBy !== "buyer") {
    throw new Error("Forbidden");
  }

  return dispute;
}

export async function markInReview(id, user) {
  if (user.role !== "admin") throw new Error("Forbidden");

  const dispute = await disputeRepository.findById(id);
  if (!dispute) throw new Error("Dispute not found");

  if (dispute.status !== "open") {
    throw new Error("Only open disputes can be reviewed");
  }

  dispute.status = "in_review";
  await dispute.save();

  return dispute;
}

export async function resolveDispute(id, data, user) {
  if (user.role !== "admin") throw new Error("Forbidden");

  const dispute = await disputeRepository.findById(id);
  if (!dispute) throw new Error("Dispute not found");

  if (dispute.status === "resolved") {
    throw new Error("Dispute already resolved");
  }

  dispute.status = "resolved";
  dispute.resolution = data.resolution;
  dispute.resolvedAt = new Date();

  await dispute.save();
  return dispute;
}

const disputeService = {
  resolveDispute,
  markInReview,
  getDisputeById,
  listDisputesProvider,
  openDispute,
};
export default disputeService;
