import { AppError } from "../utils/error.class.js";
import * as assetServices from "./../services/asset.services.js";
import multer from "multer";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import path from "path";
import { s3, S3_BUCKET_NAME, S3_ENDPOINT } from "../configs/s3Configs.js";
import sharp from "sharp";
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
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const resizedImageBuffer = await sharp(req.file.buffer)
      .resize(200, 200)
      .webp({ quality: 80 })
      .toBuffer();
    const fileExt = ".webp";
    const fileName = `${Date.now()}-${req.file.originalname}${fileExt}`;
    const key = `images/profile/${fileName}`;
    const command = new PutObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: key,
      Body: resizedImageBuffer,
      ContentType: req.file.mimetype,
      ACL: "public-read",
    });
    await s3.send(command);
    // const fileUrl = `https://${S3_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${fileName}`;
    const fileUrl = `${S3_ENDPOINT}/${S3_BUCKET_NAME}/${key}`;
    const asset = {
      name: "profileImage",
      media_type: "image",
      user_id: req.auth.id,
      type: "user",
      url: fileUrl,
    };
    await assetServices.createAsset(asset);
    res.json({ message: "File uploaded successfully", url: fileUrl });
  } catch (error) {
    next(error);
  }
}
export async function uploadDocument(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const fileName = `${Date.now()}-${req.file.originalname}`;
    const command = new PutObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: fileName,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
      ACL: "public-read",
    });
    await s3.send(command);
    // const fileUrl = `https://${S3_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${fileName}`;
    const fileUrl = `${S3_ENDPOINT}/${S3_BUCKET_NAME}/${fileName}`;
    res.json({ message: "File uploaded successfully", url: fileUrl });
  } catch (error) {
    next(error);
  }
}
