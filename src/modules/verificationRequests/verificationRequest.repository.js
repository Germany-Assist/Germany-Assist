import db from "../../database/index.js";

async function createProvider(data, t) {
  return db.VerificationRequest.create(data, { transaction: t });
}

async function getAllProvider(serviceProviderId, filters = {}) {
  return db.VerificationRequest.findAll({
    where: { ...filters, serviceProviderId },
    include: [{ model: db.Asset, attributes: ["mediaType", "url"] }],
    order: [["updatedAt", "DESC"]],
  });
}

async function countRequests(filters = {}) {
  return await db.VerificationRequest.count({
    where: filters,
    distinct: true,
    col: "id",
  });
}
async function getAllAdmin({ limit, offset, filters }) {
  return db.VerificationRequest.findAll({
    where: filters,
    include: [{ model: db.Asset, attributes: ["mediaType", "url"] }],
    order: [["updatedAt", "DESC"]],
    limit,
    offset,
  });
}

async function updateAdmin(requestId, updates, t) {
  const request = await db.VerificationRequest.findByPk(requestId, {
    transaction: t,
  });
  if (!request) return null;
  return request.update(updates);
}

const verificationRequestRepository = {
  createProvider,
  countRequests,
  getAllProvider,
  getAllAdmin,
  updateAdmin,
};

export default verificationRequestRepository;
