import { generateDownloadUrl } from "../../configs/s3Configs.js";
import AssetService from "../../services/assts.services.js";
import { AppError } from "../../utils/error.class.js";
import hashIdUtil from "../../utils/hashId.util.js";
import verificationRequestMappers from "./verificationRequest.mapper.js";
import verificationRequestRepository from "./verificationRequest.repository.js";

// Create a new verification request
async function createProvider({ auth, files, providerId, t }) {
  const exist =
    await verificationRequestRepository.getProviderStatus(providerId);
  if (exist)
    throw new AppError(
      409,
      "You already have a request for verification",
      false,
      "You already have a request for verification",
    );
  const verificationRequest = {
    serviceProviderId: providerId,
    type: "identity",
    status: "pending",
  };
  const request = await verificationRequestRepository.createProvider(
    verificationRequest,
    t,
  );
  await Promise.all(
    Object.values(files).map((i) =>
      AssetService.upload({
        type: i[0].fieldname,
        files: [i[0]],
        auth,
        params: { id: hashIdUtil.hashIdEncode(request.id) },
        transaction: t,
      }),
    ),
  );
  return { message: "Create request service - not implemented" };
}
async function providerStatus(providerId) {
  const request =
    await verificationRequestRepository.getProviderStatus(providerId);
  if (request)
    return await verificationRequestMappers.singleRequestMapper(request);
  return null;
}
async function updateProvider({ auth, files, providerId, t }) {
  const exist =
    await verificationRequestRepository.getProviderStatus(providerId);
  if (!exist || exist.status != "adminRequest")
    throw new AppError(
      409,
      "You already have a request for verification",
      false,
      "You already have a request for verification",
    );
  const verificationRequest = {
    serviceProviderId: providerId,
    type: "identity",
    status: "pending",
  };
  const request = await verificationRequestRepository.updateAdmin(
    exist.id,
    { status: "pending" },
    t,
  );
  await Promise.all(
    Object.values(files).map((i) =>
      AssetService.upload({
        type: i[0].fieldname,
        files: [i[0]],
        auth,
        params: { id: hashIdUtil.hashIdEncode(request.id) },
        transaction: t,
      }),
    ),
  );
  return { message: "Create request service - not implemented" };
}

// Get all requests of the logged-in service provider
async function getAllProvider(serviceProviderId, filters) {
  // TODO: fetch requests by serviceProviderId, optionally filter by status/type
  return { message: "Get all requests service - not implemented" };
}
// ================== Admin ==================

// Admin: get all requests with optional filters
async function getAllAdmin(query) {
  const filters = {};
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const offset = (page - 1) * limit;
  if (query.type) filters.type = query.type;
  if (query.status) filters.status = query.status;

  const total = await verificationRequestRepository.countRequests(filters);
  const rows = await verificationRequestRepository.getAllAdmin({
    limit,
    offset,
    filters,
  });
  const data = await verificationRequestMappers.multiRequestMapper(rows);
  const response = {
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    data,
  };
  return response;
}

// Admin: approve or reject a request
async function updateAdmin(requestId, updates) {
  const { adminNote, status } = updates;
  const update = await verificationRequestRepository.updateAdmin(requestId, {
    adminNote,
    status,
  });
  //if identity i should update the state of the provider also
  if (!update)
    throw new AppError(
      404,
      "failed to update request",
      true,
      "failed to update request",
    );
}
const verificationRequestService = {
  createProvider,
  getAllProvider,
  providerStatus,
  getAllAdmin,
  updateAdmin,
  updateProvider,
};

export default verificationRequestService;
