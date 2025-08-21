import express from "express";
import jwt from "../middlewares/jwt.middleware.js";
import {
  assignPermission,
  getPersonalPermissions,
  getUserPermissions,
  revokePermission,
} from "../controllers/permission.controller.js";
const permissionRouter = express.Router();

permissionRouter.post("/assign", jwt.authenticateJwt, assignPermission);
permissionRouter.post("/revoke", jwt.authenticateJwt, revokePermission);
permissionRouter.get(
  "/user/personal",
  jwt.authenticateJwt,
  getPersonalPermissions
);
permissionRouter.post("/user", jwt.authenticateJwt, getUserPermissions);
permissionRouter.get(
  "/user/available",
  jwt.authenticateJwt,
  getPersonalPermissions
);
export default permissionRouter;
