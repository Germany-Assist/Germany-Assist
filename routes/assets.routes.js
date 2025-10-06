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
  upload.array("files", 10),
  assetController.uploadDocument
);
assetRouter.post(
  "/image/gallery/upload",
  jwtUtils.authenticateJwt,
  upload.array("image", 5),
  assetController.uploadServiceImage
);
assetRouter.post(
  "/image/service/upload",
  jwtUtils.authenticateJwt,
  upload.array("image", 5),
  assetController.uploadServiceImage
);
// assetRouter.get("/file/:key")
export default assetRouter;
