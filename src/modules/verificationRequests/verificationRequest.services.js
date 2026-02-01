import { generateDownloadUrl } from "../../configs/s3Configs.js";
import AssetService from "../../services/assts.services.js";
import { AppError } from "../../utils/error.class.js";
import hashIdUtil from "../../utils/hashId.util.js";
import serviceProviderRepository from "../serviceProvider/serviceProvider.repository .js";
import providerCategoryRepository from "../serviceProviderCategory/serviceProviderCategory.repository.js";
import verificationRequestMappers from "./verificationRequest.mapper.js";
import verificationRequestRepository from "./verificationRequest.repository.js";

// Create a new verification request
async function createProvider({ auth, files, providerId, t, relatedId, type }) {
  const exist = await verificationRequestRepository.getAllProvider(providerId);
  const unhashedRelatedId = hashIdUtil.hashIdDecode(relatedId);

  if (
    exist &&
    exist.length > 0 &&
    exist.some((i) => i.relatedId === unhashedRelatedId)
  )
    throw new AppError(
      409,
      "You already have a request for verification",
      false,
      "You already have a request for verification",
    );
  const identityStatus = exist.some(
    (i) => i.type === "identity" && i.status == "approved",
  );
  if (identityStatus == "pending") {
    throw new AppError(
      409,
      "You already have a request for verification",
      false,
      "You already have a request for verification",
    );
  }
  if (!identityStatus && type == "category")
    throw new AppError(
      404,
      "You Need to verify you identity first",
      true,
      "You Need to verify you identity first",
    );

  const verificationRequest = {
    serviceProviderId: providerId,
    type: type,
    relatedId: unhashedRelatedId,
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
async function getAllProvider(providerId) {
  const requests =
    await verificationRequestRepository.getAllProvider(providerId);
  if (requests)
    return await verificationRequestMappers.multiRequestMapper(requests);
  return null;
}
async function updateProvider({ auth, files, providerId, relatedId, type, t }) {
  const unhashedRelatedId = hashIdUtil.hashIdDecode(relatedId);
  const filters = { type };
  if (type !== "identity") filters.relatedId = unhashedRelatedId;

  const exist = await verificationRequestRepository.getAllProvider(
    providerId,
    filters,
  );

  if (!exist || !exist[0] || exist[0].status != "adminRequest")
    throw new AppError(
      409,
      "You already have a request for verification",
      false,
      "You already have a request for verification",
    );
  const request = await verificationRequestRepository.updateAdmin(
    exist[0].id,
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

async function updateAdmin(requestId, updates, t) {
  const { adminNote, status } = updates;
  const update = await verificationRequestRepository.updateAdmin(requestId, {
    adminNote,
    status,
  });
  if (update.type === "identity" && update.status === "approved")
    await serviceProviderRepository.updateServiceProvider(
      { isVerified: true },
      update.serviceProviderId,
      t,
    );
  if (update.type === "category" && update.status === "approved") {
    await providerCategoryRepository.createNew(
      update.relatedId,
      update.serviceProviderId,
      t,
    );
  }

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
  getAllAdmin,
  updateAdmin,
  updateProvider,
};

export default verificationRequestService;
