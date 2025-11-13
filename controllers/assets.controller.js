import * as assetServices from "./../services/asset.services.js";
import { v4 as uuid } from "uuid";
import {
  generateDownloadUrl,
  listS3Assets,
  S3_BUCKET_NAME,
  S3_ENDPOINT,
  uploadDocumentsToS3,
  uploadImagesToS3,
  uploadVideoToS3,
} from "../configs/s3Configs.js";
import { imageResizeS3 } from "../utils/sharp.util.js";
import { AppError } from "../utils/error.class.js";
import authUtil from "../utils/authorize.util.js";
import path from "node:path";
import hashIdUtil from "../utils/hashId.util.js";

function formatSearchFilters(type, auth, params, constrains) {
  const searchFilters = { key: type };
  const ownerType = constrains.ownerType;
  switch (ownerType) {
    case "serviceProvider":
      if (!auth.related_id)
        throw new AppError(500, "invalid upload attempt", false);
      searchFilters.service_provider_id = auth.related_id;
      break;
    case "service":
      if (!auth.related_id)
        throw new AppError(500, "invalid upload attempt", false);
      searchFilters.service_id = hashIdUtil.hashIdDecode(params.id);
      searchFilters.service_provider_id = auth.related_id;
      break;
    case "post":
      if (!auth.related_id)
        throw new AppError(500, "invalid upload attempt", false);
      searchFilters.post_id = hashIdUtil.hashIdDecode(params.id);
      searchFilters.service_provider_id = auth.related_id;
      break;
    case "user":
      searchFilters.user_id = auth.id;
      break;
    default:
      throw new AppError(500, "invalid owner type", false);
  }
  return searchFilters;
}
const formatUrls = (arr) => {
  return arr.map((i) => {
    return {
      key: i.key,
      type: i.type,
      url: `${S3_ENDPOINT}/${S3_BUCKET_NAME}/${i.key}`,
      thumb: i.thumb,
      id: i.id,
      size: i.size,
    };
  });
};
const formatForAssets = ({ urls, auth, mediaType, postId, serviceId }) => {
  return urls.map((i) => {
    return {
      name: i.id,
      size: i.size,
      media_type: mediaType,
      service_provider_id: auth.related_id ?? null,
      service_id: serviceId ?? null,
      post_id: postId ?? null,
      user_id: auth.id,
      key: i.type,
      thumb: i.thumb,
      url: i.url,
      confirmed: true,
    };
  });
};
async function validateAndSizeCount(type, files, searchFilters, constrains) {
  const totalFiles = files.length;
  for (const file of files) {
    const size = file.buffer.length;
    const limit = constrains.limit;
    const allowedSize = constrains.size;
    if (!limit || !type || !size)
      throw new AppError(500, "Bad type for asset", false);
    const currentFilesCount = await assetServices.countAssetsInDatabase(
      searchFilters
    );
    if (currentFilesCount + totalFiles > limit && allowedSize != "*")
      throw new AppError(
        400,
        "reaching the upload limit",
        false,
        `You have reached or trying to upload above upload limit which is ${limit} for ${type} filed please consider removing existing asset`
      );
    if (size > allowedSize && allowedSize != "*")
      throw new AppError(
        413,
        "Exceeding the file allowed size",
        false,
        `You have exceeded the upload file limit size which is ${allowedSize} for ${type} filed please consider removing reducing the file`
      );
  }
}
function formatVideosToS3(files, type, constrains) {
  const videos = [];
  const basekey = constrains.basekey;
  for (const file of files) {
    const id = uuid();
    const ext = path.extname(file.originalname);
    const videoKey = `${basekey}/${id}${ext}`;
    videos.push({
      key: videoKey,
      buffer: file.buffer,
      type: type,
      thumb: false,
      id: id,
      size: file.buffer.length,
      mimetype: file.mimetype,
    });
  }
  return videos;
}
function formatDocumentToS3(files, type, constrains) {
  const basekey = constrains.basekey;
  const documents = [];
  for (const file of files) {
    const id = uuid();
    const ext = path.extname(file.originalname);
    const documentKey = `${basekey}/${id}${ext}`;
    documents.push({
      key: documentKey,
      buffer: file.buffer,
      type: type,
      thumb: false,
      id: id,
      size: file.buffer.length,
      mimetype: file.mimetype,
    });
  }
  return documents;
}
async function formatImagesToS3(files, type, constrains) {
  const basekey = constrains.basekey;
  const thumb = constrains.thumb;
  const images = [];
  for (const file of files) {
    const id = uuid();
    const imageKey = `${basekey}/${id}.webp`;
    const imageBuffer = await imageResizeS3(file, 400, 400);
    images.push({
      key: imageKey,
      buffer: imageBuffer,
      type: type,
      thumb: false,
      id: id,
      size: imageBuffer.length,
    });
    if (thumb) {
      const thumbKey = `${basekey}/thumb/${id}.webp`;
      const thumbBuffer = await imageResizeS3(file, 200, 200);
      images.push({
        key: thumbKey,
        buffer: thumbBuffer,
        type: type,
        thumb: true,
        id: id,
        size: thumbBuffer.length,
      });
    }
  }
  return images;
}
export async function getAllAssets(req, res, next) {
  try {
    await authUtil.checkRoleAndPermission(req.auth, ["admin", "super_admin"]);
    const resp = await assetServices.getAllAssets(req.query);
    res.send(resp);
  } catch (error) {
    next(error);
  }
}
export async function getAllExistingAssets(req, res, next) {
  try {
    await authUtil.checkRoleAndPermission(req.auth, ["admin", "super_admin"]);
    const resp = await listS3Assets();
    res.send(resp);
  } catch (error) {
    next(error);
  }
}
export async function deleteAssetClient(req, res, next) {
  try {
    const { name } = req.params;
    await authUtil.checkRoleAndPermission(
      req.auth,
      ["admin", "super_admin"],
      true,
      "asset",
      "delete"
    );
    const filters = {
      user_id: req.auth.id,
      service_provider_id: null,
      name,
    };
    const resp = await assetServices.deleteAsset(filters);
    res.status(200).send({ success: true, message: "Deleted successfully" });
  } catch (error) {
    next(error);
  }
}
export async function deleteAsset(req, res, next) {
  try {
    const { name } = req.params;
    await authUtil.checkRoleAndPermission(
      req.auth,
      ["admin", "super_admin"],
      true,
      "asset",
      "delete"
    );
    const filters = {
      name,
    };
    const resp = await assetServices.deleteAsset(filters);
    res.status(200).send({ success: true, message: "Deleted successfully" });
  } catch (error) {
    next(error);
  }
}
export async function deleteAssetsOfSp(req, res, next) {
  try {
    const { name } = req.params;
    await authUtil.checkRoleAndPermission(
      req.auth,
      ["service_provider_root", "service_provider_rep"],
      true,
      "asset",
      "delete"
    );
    const filters = {
      service_provider_id: req.auth.related_id,
      name,
    };
    const resp = await assetServices.deleteAsset(filters);
    res.status(200).send({ success: true, message: "Deleted successfully" });
  } catch (error) {
    next(error);
  }
}
export function uploadFiles(type) {
  return async (req, res, next) => {
    try {
      // basic validation
      if (!type) throw new AppError(500, "invalid type", false);
      if (!req.file && !req.files)
        return res.status(400).json({ error: "No file uploaded" });
      // basic authorization
      await authUtil.checkRoleAndPermission(
        req.auth,
        [
          "service_provider_root",
          "service_provider_rep",
          "client",
          "admin",
          "super_admin",
        ],
        true,
        "asset",
        "update"
      );
      // extracting Constrains
      const constrains = await assetServices.extractConstrains(type);
      // extracting the files always as an array
      const files = req.files || (req.file ? [req.file] : []);
      // setting the search filters to check the limits and extract params for service and posts and also the correct ownership
      const searchFilters = formatSearchFilters(
        type,
        req.auth,
        req.params,
        constrains
      );

      // validate the size lieut and count
      await validateAndSizeCount(type, files, searchFilters, constrains);
      let filesToUpload;
      let uploads;
      switch (constrains.mediaType) {
        case "image":
          filesToUpload = await formatImagesToS3(files, type, constrains);
          uploads = await uploadImagesToS3(filesToUpload);
          break;
        case "video":
          filesToUpload = formatVideosToS3(files, type, constrains);
          uploads = await uploadVideoToS3(filesToUpload);
          break;
        case "document":
          filesToUpload = formatDocumentToS3(files, type, constrains);
          uploads = await uploadDocumentsToS3(filesToUpload);
          break;
        default:
          throw new AppError(
            500,
            "failed to find the correct media type",
            false
          );
      }
      const urls = formatUrls(filesToUpload);
      const assets = formatForAssets({
        urls: urls,
        auth: req.auth,
        mediaType: constrains.mediaType,
        postId: searchFilters.post_id,
        serviceId: searchFilters.service_id,
      });

      await assetServices.createAssets(assets);
      const publicUrls = [];
      for (const url of urls) {
        publicUrls.push({
          ...url,
          url: await generateDownloadUrl(url.url),
        });
      }
      res.json({ message: "File uploaded successfully", publicUrls });
    } catch (error) {
      next(error);
    }
  };
}
const uploadController = {
  uploadFiles,
};
export default uploadController;
