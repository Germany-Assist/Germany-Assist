import express from "express";
import { authenticateJwt } from "../middlewares/jwt.middleware.js";
import { authorizeRequest } from "../middlewares/authorize.checkpoint.js";
import {
  assignPermission,
  revokePermission,
} from "../controllers/permission.controller.js";
const permissionRouter = express.Router();
/// important to check the ownership of the specific target

permissionRouter.post(
  "/assign",
  authenticateJwt,
  authorizeRequest(
    ["root", "admin", "superAdmin"],
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
    ["root", "admin", "superAdmin"],
    true,
    "permission",
    "revoke",
    true,
    "business",
    "User"
  ),
  revokePermission
);
export default permissionRouter;
