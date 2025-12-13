import db from "../../database/index.js";
import { AppError } from "../../utils/error.class.js";

// Create a new asset
export const createAsset = async (data) => {
  const { name, mediaType, userId, type, url } = data;
  return await db.Asset.create({
    name,
    mediaType,
    userId,
    type,
    url,
  });
};
export const extractConstrains = async (type) => {
  const con = await db.AssetTypes.findOne({ where: { key: type }, raw: true });
  if (!con) throw new AppError(500, "invalid constrain key type", false);
  return con;
};
export const countAssetsInDatabase = async (filters) => {
  const result = await db.Asset.findAndCountAll({
    where: { ...filters, thumb: false },
    raw: true,
  });
  return result.count;
};
export const createAssets = async (data) => {
  return await db.Asset.bulkCreate(data);
};
export const getAllAssets = async (filters = {}) => {
  const page = parseInt(filters.page) || 1;
  const limit = parseInt(filters.limit) || 10;
  const offset = (page - 1) * limit;
  const where = { ...filters };
  const sortField = filters.sort || "createdAt";
  const sortOrder = filters.order === "asc" ? "ASC" : "DESC";
  const { rows: asset, count } = await db.Asset.findAndCountAll({
    where,
    limit,
    offset,
    order: [[sortField, sortOrder]],
  });
  return {
    page,
    limit,
    total: count,
    totalPages: Math.ceil(count / limit),
    data: asset,
  };
};

// Get a single asset by ID
export const getAssetById = async (id) => {
  const asset = await db.Asset.findByPk(id);
  if (!asset) throw new AppError(404, "no asset found", true, "no asset found");
  return asset;
};

// Update an asset
export const updateAsset = async (id, updateData) => {
  //this needs to be updated so it can handle injections i should make it for specific fields
  //but that depends on the autorization
  const asset = await db.Asset.findByPk(id);
  if (!asset) throw new AppError(404, "no asset found", true, "no asset found");
  await asset.update(updateData);
  return asset;
};

// Delete an asset
export const deleteAsset = async (filters) => {
  const asset = await db.Asset.destroy({ where: filters, returning: true });
  if (!asset.length)
    throw new AppError(404, "no asset found", true, "no asset found");
  return true;
};

// Restore a soft-deleted asset
export const restoreAsset = async (id) => {
  const asset = await db.Asset.findOne({
    where: { id },
    paranoid: false,
  });
  if (!asset) throw new AppError(404, "no asset found", true, "no asset found");
  if (!asset.deletedAt)
    throw new AppError(400, "no asset found", true, "Asset is not deleted");
  await asset.restore();
  return asset;
};
const assetServices = {
  restoreAsset,
  deleteAsset,
  updateAsset,
  getAssetById,
  getAllAssets,
  countAssetsInDatabase,
  extractConstrains,
  createAsset,
  createAssets,
};
export default assetServices;
