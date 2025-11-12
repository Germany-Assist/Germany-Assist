import * as assetServices from "./../services/asset.services.js";
import { v4 as uuid } from "uuid";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import {
  s3,
  S3_BUCKET_NAME,
  S3_ENDPOINT,
  UploadConstrains,
  uploadImagesToS3,
} from "../configs/s3Configs.js";
import userServices from "../services/user.services.js";
import { imageResizeS3 } from "../utils/sharp.util.js";
import db from "../database/dbIndex.js";
import { AppError } from "../utils/error.class.js";
import authUtil from "../utils/authorize.util.js";

const countAssetsInDatabase = async (filters) => {
  return await db.Asset.findAndCountAll({
    where: { ...filters, thumb: false },
    raw: true,
  });
};
const formatUrls = (images) => {
  return images.map((i) => {
    return {
      type: i.type,
      url: `${S3_ENDPOINT}/${S3_BUCKET_NAME}/${i.key}`,
      thumb: i.thumb,
      id: i.id,
      size: i.size,
    };
  });
};
const formatImagesForAssets = (urls, auth) => {
  return urls.map((i) => {
    return {
      name: i.id,
      size: i.size,
      media_type: "image",
      service_provider_id: auth.related_id,
      owner_type: "user",
      user_id: auth.id,
      type: i.type,
      thumb: i.thumb,
      url: i.url,
      confirmed: true,
    };
  });
};
async function validateAndSizeCount({
  type,
  totalFiles,
  size,
  ownerType,
  ownerId,
}) {
  const limit = UploadConstrains[type]?.limit;
  const allowedSize = UploadConstrains[type]?.size;
  if (!limit || !type) throw new AppError(500, "Bad type for asset", false);
  const searchFilters = { type, [ownerType]: ownerId };
  const currentFilesCount = (await countAssetsInDatabase(searchFilters)).count;
  if (
    currentFilesCount === limit ||
    currentFilesCount > limit ||
    currentFilesCount + totalFiles > limit
  )
    throw new AppError(
      409,
      "reaching the upload limit",
      false,
      `You have reached or trying to upload above upload limit which is ${limit} for ${type} filed please consider removing existing asset`
    );
  if (size > allowedSize)
    throw new AppError(
      409,
      "Exceeding the file allowed size",
      false,
      `You have exceeded the upload file limit size which is ${allowedSize} for ${type} filed please consider removing reducing the file`
    );
  return true;
}
async function formatImagesToS3(files, type, basekey, thumb) {
  const images = [];
  for (const file of files) {
    const id = uuid();
    const imageKey = `${basekey}/${id}.webp`;
    const imageBuffer = await imageResizeS3(file, 400, 400);
    if (thumb) {
      const thumbKey = `${basekey}/thumb/${id}.webp`;
      const thumbBuffer = await imageResizeS3(file, 200, 200);
      images.push(
        {
          key: imageKey,
          buffer: imageBuffer,
          type: type,
          thumb: false,
          id: id,
          size: imageBuffer.length,
        },
        {
          key: thumbKey,
          buffer: thumbBuffer,
          thumb: true,
          type: type,
          id: id,
          size: thumbBuffer.length,
        }
      );
    } else {
      images.push({
        key: imageKey,
        buffer: imageBuffer,
        type: "serviceProviderProfileImage",
        thumb: false,
      });
    }
  }
  return images;
}
export async function getAllAssets(req, res, next) {
  try {
    const resp = await assetServices.getAllAssets();
    res.send(resp);
  } catch (error) {
    next(error);
  }
}
export async function getAssetById(req, res, next) {
  try {
    const { id } = req.params;
    const resp = await assetServices.getAssetById(id);
    res.send(resp);
  } catch (error) {
    next(error);
  }
}
export async function updateAsset(req, res, next) {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const resp = await assetServices.updateAsset(id, updateData);
    res.send(resp);
  } catch (error) {
    next(error);
  }
}
export async function deleteAsset(req, res, next) {
  try {
    const { id } = req.params;
    const resp = await assetServices.deleteAsset(id);
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
}
export async function restoreAsset(req, res, next) {
  try {
    const { id } = req.params;
    const resp = await assetServices.restoreAsset(id);
    res.send(resp);
  } catch (error) {
    next(error);
  }
}
export async function uploadProfileImage(req, res, next) {
  try {
    // validation
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    // image handling
    const file = req.file;
    const images = [];
    const id = uuid();
    //regular
    images.push(await imageResizeS3(file, id, "profile", 400, 400));
    //thumbnail
    images.push(await imageResizeS3(file, id, "thumb", 200, 200));

    // image uploading
    const uploads = images.map((image) => {
      return s3.send(
        new PutObjectCommand({
          Bucket: S3_BUCKET_NAME,
          Key: image.key,
          Body: image.resizedImageBuffer,
          ContentType: "image/webp",
          ACL: "public-read",
        })
      );
    });
    const files = await Promise.all(uploads);
    const urls = images.map((i) => {
      return { type: i.type, url: `${S3_ENDPOINT}/${S3_BUCKET_NAME}/${i.key}` };
    });
    const assets = urls.map((i) => {
      return {
        name: "profile",
        media_type: "image",
        service_provider_id: req.auth.related_id,
        owner_type: "user",
        user_id: req.auth.id,
        type: i.type,
        url: i.url,
      };
    });
    await assetServices.createAssets(assets);
    await userServices.updateUser(req.auth.id, { image: urls[0].url });
    res.json({ message: "File uploaded successfully", urls });
  } catch (error) {
    next(error);
  }
}
export async function uploadServiceImage(req, res, next) {
  try {
    // validation
    if (!req.files || req.files.length < 1)
      return res.status(400).json({ error: "No file uploaded" });
    // image handling
    const images = [];
    for (let i = 0; i < req.files.length; i++) {
      const id = uuid();
      //regular
      images.push(await imageResizeS3(req.files[i], id, "gallery", 400, 400));
      //thumbnail
      images.push(await imageResizeS3(req.files[i], id, "thumb", 200, 200));
    }
    // image uploading
    const uploads = images.map((image) => {
      return s3.send(
        new PutObjectCommand({
          Bucket: S3_BUCKET_NAME,
          Key: image.key,
          Body: image.resizedImageBuffer,
          ContentType: "image/webp",
          ACL: "public-read",
        })
      );
    });
    const files = await Promise.all(uploads);
    const urls = images.map((i) => {
      return {
        type: i.type,
        url: `${S3_ENDPOINT}/${S3_BUCKET_NAME}/${i.key}`,
      };
    });
    const assets = urls.map((i) => {
      return {
        name: "gallery",
        media_type: "image",
        service_provider_id: req.auth.related_id,
        owner_type: "service_provider",
        user_id: req.auth.id,
        type: i.type,
        url: i.url,
      };
    });
    await assetServices.createAssets(assets);
    res.json({ message: "File uploaded successfully", urls });
  } catch (error) {
    next(error);
  }
}
export async function uploadDocument(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const fileName = `${Date.now()}-${req.file.originalname}`;
    const key = `documents/users/${fileName}`;
    const command = new PutObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: key,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
      ACL: "public-read",
    });
    await s3.send(command);
    const fileUrl = `${S3_ENDPOINT}/${S3_BUCKET_NAME}/${fileName}`;
    res.json({ message: "File uploaded successfully", url: fileUrl });
  } catch (error) {
    next(error);
  }
}
export async function serviceProviderProfileImage(req, res, next) {
  const type = "serviceProviderProfileImage";
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    //i think i will discusses with amr what permissions should be added
    await authUtil.checkRoleAndPermission(
      req.auth,
      ["service_provider_root", "service_provider_rep"],
      true,
      "asset",
      "update"
    );

    const constrains = UploadConstrains[type];
    // i need to convert all to an array in order to let all the helpers work correctly
    let files = [];
    if (req.file) {
      files.push(req.file);
    } else {
      files = req.files;
    }
    // validation for all the files
    //this should exist for all of them for filtering existing assets
    //just replace the ownerId and ownerType depending on the requirement
    for (const file of files) {
      const filters = {
        type,
        ownerType: "service_provider_id",
        ownerId: req.auth.related_id,
        size: file.size,
        totalFiles: files.length,
      };
      // this will count and throw an error if exceeding the limit; the limit is extracted from the constrains
      await validateAndSizeCount(filters);
    }
    // this will prepare the files to upload the first parameter should be an array
    const images = await formatImagesToS3(
      files,
      type,
      constrains.basekey,
      constrains.thumb
    );
    //upload the images
    const uploads = await uploadImagesToS3(images);

    const urls = formatUrls(images);
    const assets = formatImagesForAssets(urls, req.auth);
    await assetServices.createAssets(assets);
    res.json({ message: "File uploaded successfully", urls });
  } catch (error) {
    next(error);
  }
}
const uploadController = { serviceProviderProfileImage };
export default uploadController;
