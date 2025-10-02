import express from "express";
import * as assetController from "../controllers/assets.controller.js";
import multer from "multer";
import jwtUtils from "../middlewares/jwt.middleware.js";
const assetRouter = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

assetRouter.post("/", assetController.createAsset);
assetRouter.get("/", assetController.getAllAssets);
assetRouter.get("/:id", assetController.getAssetById);
assetRouter.put("/:id", assetController.updateAsset);
assetRouter.delete("/:id", assetController.deleteAsset);
assetRouter.post("/:id/restore", assetController.restoreAsset);

assetRouter.post(
  "/image/profile/upload",
  jwtUtils.authenticateJwt,
  upload.single("image"),
  assetController.uploadProfileImage
);
assetRouter.post(
  "/documents/upload",
  upload.single("documents"),
  assetController.uploadDocument
);
// assetRouter.get("/file/:key")
export default assetRouter;
