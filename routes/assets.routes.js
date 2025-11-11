import express from "express";
import uploadController, * as assetController from "../controllers/assets.controller.js";
import multer from "multer";
import jwtUtils from "../middlewares/jwt.middleware.js";
const assetRouter = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

assetRouter.get("/", assetController.getAllAssets);
assetRouter.get("/:id", assetController.getAssetById);
assetRouter.put("/:id", assetController.updateAsset);
assetRouter.delete("/:id", assetController.deleteAsset);
assetRouter.post("/:id/restore", assetController.restoreAsset);

// assetRouter.post(
//   "/image/profile/upload",
//   jwtUtils.authenticateJwt,
//   upload.single("image"),
//   assetController.uploadProfileImage
// );
// assetRouter.post(
//   "/documents/upload",
//   upload.array("files", 10),
//   assetController.uploadDocument
// );
// assetRouter.post(
//   "/image/gallery/upload",
//   jwtUtils.authenticateJwt,
//   upload.array("image", 5),
//   assetController.uploadServiceImage
// );
// assetRouter.post(
//   "/image/service/upload",
//   jwtUtils.authenticateJwt,
//   upload.array("image", 5),
//   assetController.uploadServiceImage
// );

// SP Profile
assetRouter.post(
  "/upload/serviceProvider/image/profileImage",
  jwtUtils.authenticateJwt,
  upload.single("image"),
  uploadController.serviceProviderProfileImage
);
// assetRouter.post(
//   "/upload/serviceProvider/image/profileGallery",
//   jwtUtils.authenticateJwt,
//   upload.array("image", 5)
// );
// assetRouter.post(
//   "/upload/serviceProvider/video/profileGallery",
//   jwtUtils.authenticateJwt,
//   upload.array("video", 2)
// );
// assetRouter.post(
//   "/upload/serviceProvider/document/profileDocuments",
//   jwtUtils.authenticateJwt,
//   upload.array("document", 5)
// );

// // SP service
// assetRouter.post(
//   "/upload/serviceProvider/service/image/serviceImage",
//   jwtUtils.authenticateJwt,
//   upload.single("image")
// );
// assetRouter.post(
//   "/upload/serviceProvider/service/image/serviceGallery",
//   jwtUtils.authenticateJwt,
//   upload.array("image", 5)
// );
// assetRouter.post(
//   "/upload/serviceProvider/service/video/serviceGallery",
//   jwtUtils.authenticateJwt,
//   upload.array("video", 2)
// );

// // SP post
// assetRouter.post(
//   "/upload/serviceProvider/post/image/postAttachments",
//   jwtUtils.authenticateJwt,
//   upload.single("image")
// );
// assetRouter.post(
//   "/upload/serviceProvider/post/video/postAttachments",
//   jwtUtils.authenticateJwt,
//   upload.single("video")
// );
// assetRouter.post(
//   "/upload/serviceProvider/post/documents/postAttachments",
//   jwtUtils.authenticateJwt,
//   upload.single("document")
// );
// assetRouter.post(
//   "/upload/serviceProvider/post/file/postAttachments",
//   jwtUtils.authenticateJwt,
//   upload.single("file")
// );

// // Admin
// assetRouter.post(
//   "/upload/admin/post/image/appAssets",
//   jwtUtils.authenticateJwt,
//   upload.single("image")
// );
// assetRouter.post(
//   "/upload/admin/post/video/appAssets",
//   jwtUtils.authenticateJwt,
//   upload.single("video")
// );

// // All including clients have this
// assetRouter.post(
//   "/upload/users/post/image/profileImage",
//   jwtUtils.authenticateJwt,
//   upload.single("image")
// );

export default assetRouter;
