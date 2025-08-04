import * as assetServices from "./../services/asset.services.js";

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
