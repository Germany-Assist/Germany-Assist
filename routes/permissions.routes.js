import express from "express";
import { authenticateJwt } from "../middlewares/jwt.middleware.js";
import {
  authorizeOwnership,
  authorizeRequest,
  authorizeRole,
} from "../middlewares/authorize.checkpoint.js";
import {
  assignPermission,
  revokePermission,
} from "../controllers/permission.controller.js";
const permissionRouter = express.Router();
/// important to check the ownership of the specific target

permissionRouter.post(
  "/assign",
  authenticateJwt,
  authorizeRole(["root", "admin"]),
  authorizeRequest("permission", "assign"),
  authorizeOwnership("business", "User"),
  assignPermission
);

permissionRouter.post(
  "/revoke",
  authenticateJwt,
  authorizeRole(["root", "admin"]),
  authorizeRequest("permission", "revoke"),
  authorizeOwnership("business", "BusinessId", "User"),
  revokePermission
);
export default permissionRouter;
