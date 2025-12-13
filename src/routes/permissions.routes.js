import express from "express";
import jwt from "../middlewares/jwt.middleware.js";
import permissionController from "../controllers/permission.controller.js";
import { idHashedParamValidator } from "../validators/general.validators.js";
import { validateExpress } from "../middlewares/expressValidator.js";
import { createPermissionValidator } from "../validators/permission.validator.js";
const permissionRouter = express.Router();

permissionRouter.post(
  "/assign",
  jwt.authenticateJwt,
  createPermissionValidator,
  validateExpress,
  permissionController.assignPermission
);
permissionRouter.post(
  "/revoke",
  jwt.authenticateJwt,
  createPermissionValidator,
  validateExpress,
  permissionController.revokePermission
);
permissionRouter.get(
  "/user/personal",
  jwt.authenticateJwt,
  permissionController.getPersonalPermissions
);
permissionRouter.get(
  "/user/:id",
  jwt.authenticateJwt,
  idHashedParamValidator,
  validateExpress,
  permissionController.getUserPermissions
);

export default permissionRouter;
