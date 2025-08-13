import {
  adminPermissions,
  rootBusinessPermissions,
} from "../database/templates.js";
import * as permissionServices from "../services/permission.services.js";
import { AppError } from "../utils/error.class.js";
export async function assignPermission(req, res, next) {
  try {
    // to maintain security the templates only will be followed
    let allowedPermissions;
    const { userId, permissionId } = req.body;
    if (req.auth.role === "root") allowedPermissions = rootBusinessPermissions;
    if (req.auth.role === "admin") allowedPermissions = adminPermissions;
    if (!allowedPermissions.includes(permissionId))
      throw new AppError(403, "unAuthorized", true, "unAuthorized");
    permissionServices.adjustPermission(userId, permissionId, "assign");
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
}

export async function revokePermission(req, res, next) {
  try {
    let allowedPermissions;
    const { userId, permissionId } = req.body;
    if (req.auth.role === "root") allowedPermissions = rootBusinessPermissions;
    if (req.auth.role === "admin") allowedPermissions = adminPermissions;
    if (!allowedPermissions.includes(permissionId))
      throw new AppError(403, "unAuthorized", true, "unAuthorized");
    permissionServices.adjustPermission(userId, permissionId, "revoke");
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
}
