import express from "express";
import {
  createAsset,
  getAllAssets,
  getAssetById,
  updateAsset,
  deleteAsset,
  restoreAsset,
} from "../controllers/assets.controller.js";

const assteRouter = express.Router();
///// WARNING THESE END POINT NEEDS 1.Validation 2.Authorization
assteRouter.post("/", async (req, res, next) => {
  try {
    const body = req.body;
    const resp = await createAsset(body);
    res.sendStatus(201);
  } catch (error) {
    next(error);
  }
});
assteRouter.get("/", async (req, res, next) => {
  try {
    const resp = await getAllAssets();
    res.send(resp);
  } catch (error) {
    next(error);
  }
});
assteRouter.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const resp = await getAssetById(id);
    res.send(resp);
  } catch (error) {
    next(error);
  }
});
assteRouter.put("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log(req.body);
    const resp = await updateAsset(id, updateData);
    res.send(resp);
  } catch (error) {
    next(error);
  }
});
assteRouter.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const resp = await deleteAsset(id);
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
});
assteRouter.post("/:id/restore", async (req, res, next) => {
  try {
    const { id } = req.params;
    const resp = await restoreAsset(id);
    res.send(resp);
  } catch (error) {
    next(error);
  }
});

export default assteRouter;
