import express from "express";
import * as assetController from "../controllers/assets.controller.js";
const assetRouter = express.Router();

assetRouter.post("/", assetController.createAsset);
assetRouter.get("/", assetController.getAllAssets);
assetRouter.get("/:id", assetController.getAssetById);
assetRouter.put("/:id", assetController.updateAsset);
assetRouter.delete("/:id", assetController.deleteAsset);
assetRouter.post("/:id/restore", assetController.restoreAsset);

export default assetRouter;
