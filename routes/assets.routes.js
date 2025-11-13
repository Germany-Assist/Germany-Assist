import express from "express";
import uploadController, * as assetController from "../controllers/assets.controller.js";
import multer from "multer";
import jwtUtils from "../middlewares/jwt.middleware.js";
const assetRouter = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

assetRouter.get("/", assetController.getAllAssets);
assetRouter.get("/", assetController.getAllExistingAssets);

assetRouter.delete("/:id", assetController.deleteAsset);

// SP Profile
assetRouter.post(
  "/upload/serviceProvider/image/profileImage",
  jwtUtils.authenticateJwt,
  upload.single("image"),
  uploadController.uploadFiles("serviceProviderProfileImage")
);
assetRouter.post(
  "/upload/serviceProvider/image/profileGallery",
  jwtUtils.authenticateJwt,
  upload.array("image", 5),
  uploadController.uploadFiles("serviceProviderProfileGalleryImage")
);
assetRouter.post(
  "/upload/serviceProvider/video/profileGallery",
  jwtUtils.authenticateJwt,
  upload.array("video", 1),
  uploadController.uploadFiles("serviceProviderProfileGalleryVideo")
);
assetRouter.post(
  "/upload/serviceProvider/document/profileDocuments",
  jwtUtils.authenticateJwt,
  upload.array("document", 5),
  uploadController.uploadFiles("serviceProviderProfileDocument")
);

// SP service
assetRouter.post(
  "/upload/serviceProvider/service/image/serviceImage/:id",
  jwtUtils.authenticateJwt,
  upload.single("image"),
  uploadController.uploadFiles("serviceProfileImage")
);
assetRouter.post(
  "/upload/serviceProvider/service/image/serviceGallery/:id",
  jwtUtils.authenticateJwt,
  upload.array("image", 5),
  uploadController.uploadFiles("serviceProfileGalleryImage")
);
assetRouter.post(
  "/upload/serviceProvider/service/video/serviceGallery/:id",
  jwtUtils.authenticateJwt,
  upload.array("video", 2),
  uploadController.uploadFiles("serviceProfileGalleryVideo")
);

// SP post
assetRouter.post(
  "/upload/serviceProvider/post/image/postAttachments/:id",
  jwtUtils.authenticateJwt,
  upload.single("image"),
  uploadController.uploadFiles("postAttachmentsImage")
);
assetRouter.post(
  "/upload/serviceProvider/post/video/postAttachments/:id",
  jwtUtils.authenticateJwt,
  upload.single("video"),
  uploadController.uploadFiles("postAttachmentsVideo")
);
assetRouter.post(
  "/upload/serviceProvider/post/documents/postAttachments/:id",
  jwtUtils.authenticateJwt,
  upload.single("document"),
  uploadController.uploadFiles("postAttachmentsDocuments")
);
// Admin
assetRouter.post(
  "/upload/admin/post/image/appAssets",
  jwtUtils.authenticateJwt,
  upload.single("image"),
  uploadController.uploadFiles("postAttachmentsDocuments")
);
assetRouter.post(
  "/upload/admin/post/video/appAssets",
  jwtUtils.authenticateJwt,
  upload.single("video"),
  uploadController.uploadFiles("postAttachmentsDocuments")
);
// Public
assetRouter.post(
  "/upload/users/post/image/profileImage",
  jwtUtils.authenticateJwt,
  upload.single("image"),
  uploadController.uploadFiles("userImage")
);

export default assetRouter;
