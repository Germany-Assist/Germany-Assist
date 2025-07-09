import db from "../database/dbIndex.js";

// Create a new asset
export const createAsset = async (data) => {
  const {
    name,
    media_type,
    userId,
    businessProfileId,
    providersProfileId,
    serviceId,
    type,
    url,
    requests,
  } = data;

  return await db.Asset.create({
    name,
    media_type,
    userId,
    businessProfileId: businessProfileId || null,
    providersProfileId: providersProfileId || null,
    serviceId,
    type,
    url,
    requests: requests || 0,
  });
};

// Get all assets
export const getAllAssets = async (filters = {}) => {
  return await db.Asset.findAll({
    where: filters,
  });
};

// Get a single asset by ID
export const getAssetById = async (id) => {
  const asset = await db.Asset.findByPk(id);
  if (!asset) throw new Error("Asset not found");
  return asset;
};

// Update an asset
export const updateAsset = async (id, updateData) => {
  const asset = await db.Asset.findByPk(id);
  if (!asset) throw new Error("Asset not found");
  await asset.update(updateData);
  return asset;
};

// Delete an asset
export const deleteAsset = async (id) => {
  const asset = await db.Asset.findByPk(id);
  if (!asset) throw new Error("Asset not found");
  await asset.destroy();
  return { message: "Asset deleted successfully" };
};

// Restore a soft-deleted asset
export const restoreAsset = async (id) => {
  const asset = await db.Asset.findOne({
    where: { id },
    paranoid: false,
  });
  if (!asset) throw new Error("Asset not found");
  if (!asset.deletedAt) throw new Error("Asset is not deleted");
  await asset.restore();
  return asset;
};
