import express from "express";
import uploadController from "../controllers/assets.controller.js";
import multer from "multer";
import jwtUtils from "../middlewares/jwt.middleware.js";
const assetRouter = express.Router();

const upload = multer({ storage: multer.memoryStorage() });
const spRoles = ["service_provider_root", "service_provider_rep"];
const adminRoles = ["admin", "super_admin"];

assetRouter.get("/", jwtUtils.authenticateJwt, uploadController.getAllAssets);
assetRouter.get(
  "/existing",
  jwtUtils.authenticateJwt,
  uploadController.getAllExistingAssets
);
assetRouter.post(
  "/admin/signUrl",
  jwtUtils.authenticateJwt,
  uploadController.signUrl
);

assetRouter.delete(
  "/serviceProvider/:name",
  jwtUtils.authenticateJwt,
  uploadController.deleteAssetsOfSp
);
assetRouter.delete(
  "/client/:name",
  jwtUtils.authenticateJwt,
  uploadController.deleteAssetClient
);
assetRouter.delete(
  "/admin/:name",
  jwtUtils.authenticateJwt,
  uploadController.deleteAsset
);

// SP Profile
assetRouter.post(
  "/upload/serviceProvider/image/profileImage",
  jwtUtils.authenticateJwt,
  upload.single("image"),
  uploadController.uploadFilesForSpProfile("serviceProviderProfileImage")
);
assetRouter.post(
  "/upload/serviceProvider/image/profileGallery",
  jwtUtils.authenticateJwt,
  upload.array("image", 5),
  uploadController.uploadFilesForSpProfile("serviceProviderProfileGalleryImage")
);
assetRouter.post(
  "/upload/serviceProvider/video/profileGallery",
  jwtUtils.authenticateJwt,
  upload.array("video", 1),
  uploadController.uploadFilesForSpProfile("serviceProviderProfileGalleryVideo")
);
assetRouter.post(
  "/upload/serviceProvider/document/profileDocuments",
  jwtUtils.authenticateJwt,
  upload.array("document", 5),
  uploadController.uploadFilesForSpProfile("serviceProviderProfileDocument")
);

// SP service
assetRouter.post(
  "/upload/serviceProvider/service/image/serviceImage/:id",
  jwtUtils.authenticateJwt,
  upload.single("image"),
  uploadController.uploadFilesForService("serviceProfileImage")
);
assetRouter.post(
  "/upload/serviceProvider/service/image/serviceGallery/:id",
  jwtUtils.authenticateJwt,
  upload.array("image", 5),
  uploadController.uploadFilesForService("serviceProfileGalleryImage")
);
assetRouter.post(
  "/upload/serviceProvider/service/video/serviceGallery/:id",
  jwtUtils.authenticateJwt,
  upload.array("video", 2),
  uploadController.uploadFilesForService("serviceProfileGalleryVideo")
);

// SP post
assetRouter.post(
  "/upload/serviceProvider/post/image/postAttachments/:id",
  jwtUtils.authenticateJwt,
  upload.single("image"),
  uploadController.uploadFilesForPost("postAttachmentsImage")
);
assetRouter.post(
  "/upload/serviceProvider/post/video/postAttachments/:id",
  jwtUtils.authenticateJwt,
  upload.single("video"),
  uploadController.uploadFilesForPost("postAttachmentsVideo")
);
assetRouter.post(
  "/upload/serviceProvider/post/documents/postAttachments/:id",
  jwtUtils.authenticateJwt,
  upload.single("document"),
  uploadController.uploadFilesForPost("postAttachmentsDocuments")
);
// Admin
assetRouter.post(
  "/upload/admin/post/image/appAssets",
  jwtUtils.authenticateJwt,
  upload.single("image"),
  uploadController.uploadFilesForAdmins("assetImage")
);
assetRouter.post(
  "/upload/admin/post/video/appAssets",
  jwtUtils.authenticateJwt,
  upload.single("video"),
  uploadController.uploadFilesForAdmins("assetVideo")
);

// Public
assetRouter.post(
  "/upload/users/post/image/profileImage",
  jwtUtils.authenticateJwt,
  upload.single("image"),
  uploadController.updateUserProfileImage("userImage")
);

export default assetRouter;
