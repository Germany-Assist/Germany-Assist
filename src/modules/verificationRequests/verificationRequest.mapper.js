import { generateDownloadUrl } from "../../configs/s3Configs.js";
import hashIdUtil from "../../utils/hashId.util.js";

const singleRequestMapper = async (request) => {
  return {
    id: hashIdUtil.hashIdEncode(request.id),
    serviceProviderId: request.serviceProviderId,
    type: request.type,
    status: request.status,
    adminNote: request.adminNote,
    assets: await Promise.all(
      request.Assets.map((i) => generateDownloadUrl(i.url)),
    ),
  };
};
const multiRequestMapper = async (requests) => {
  return await Promise.all(
    requests.map(async (i) => ({
      id: hashIdUtil.hashIdEncode(i.id),
      serviceProviderId: i.serviceProviderId,
      type: i.type,
      status: i.status,
      adminNote: i.adminNote,
      relatedId: i.relatedId ? hashIdUtil.hashIdEncode(i.relatedId) : undefined,
      assets: await Promise.all(
        i.Assets.map((x) => generateDownloadUrl(x.url)),
      ),
    })),
  );
};
const verificationRequestMappers = { multiRequestMapper, singleRequestMapper };
export default verificationRequestMappers;
