import * as assetServices from "./../services/asset.services.js";
import { v4 as uuid } from "uuid";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import path from "path";
import { s3, S3_BUCKET_NAME, S3_ENDPOINT } from "../configs/s3Configs.js";
import sharp from "sharp";
import userServices from "../services/user.services.js";

const imageResizeS3 = async (image, id, keyPrefix, x, y) => {
  const fileName = `${id}.webp`;
  const key = `images/${keyPrefix}/${fileName}`;
  const resizedImageBuffer = await sharp(image.buffer)
    .resize(x, y)
    .webp({ quality: 80 })
    .toBuffer();
  return {
    resizedImageBuffer,
    key,
    id,
    type: keyPrefix,
  };
};
export async function createAsset(req, res, next) {
  try {
    const body = req.body;
    const resp = await assetServices.createAsset(body);
    res.sendStatus(201);
  } catch (error) {
    next(error);
  }
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
