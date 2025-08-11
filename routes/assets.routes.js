import express from "express";
import * as assetController from "../controllers/assets.controller.js";
const assteRouter = express.Router();

assteRouter.post("/", assetController.createAsset);
assteRouter.get("/", assetController.getAllAssets);
assteRouter.get("/:id", assetController.getAssetById);
assteRouter.put("/:id", assetController.updateAsset);
assteRouter.delete("/:id", assetController.deleteAsset);
assteRouter.post("/:id/restore", assetController.restoreAsset);

export default assteRouter;
