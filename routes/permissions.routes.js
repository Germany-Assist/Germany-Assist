import express from "express";
import { authenticateJwt } from "../middlewares/jwt.middleware.js";
import { authorizeRequest } from "../middlewares/authorize.checkpoint.js";
import {
  assignPermission,
  getPersonalPermissions,
  getUserPermissions,
  revokePermission,
} from "../controllers/permission.controller.js";
const permissionRouter = express.Router();

permissionRouter.post(
  "/assign",
  authenticateJwt,
  authorizeRequest(
    ["root", "superAdmin"],
    true,
    "permission",
    "assign",
    true,
    "business",
    "User"
  ),
  assignPermission
);
permissionRouter.post(
  "/revoke",
  authenticateJwt,
  authorizeRequest(
    ["root", "superAdmin"],
    true,
    "permission",
    "revoke",
    true,
    "business",
    "User"
  ),
  revokePermission
);
permissionRouter.get(
  "/user/personal",
  authenticateJwt,
  authorizeRequest(["root", "superAdmin"], true, "permission", "list", false),
  getPersonalPermissions
);
permissionRouter.post(
  "/user",
  authenticateJwt,
  authorizeRequest(
    ["root", "superAdmin", "admin"],
    true,
    "permission",
    "list",
    true,
    "business",
    "User"
  ),
  getUserPermissions
);
permissionRouter.get(
  "/user/available",
  authenticateJwt,
  authorizeRequest(
    ["root", "superAdmin", "admin"],
    true,
    "permission",
    "list",
    false
  ),
  getPersonalPermissions
);
export default permissionRouter;
