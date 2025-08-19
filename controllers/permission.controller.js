import { roleTemplates } from "../database/templates.js";
import permissionServices from "../services/permission.services.js";
import { AppError } from "../utils/error.class.js";
export async function assignPermission(req, res, next) {
  try {
    let allowedPermissions;
    const { id, action, resource } = req.body;
    if (req.auth.role === "root")
      allowedPermissions = roleTemplates.root_business;
    if (req.auth.role === "admin") allowedPermissions = roleTemplates.admin;
    if (
      !allowedPermissions.some(
        (p) => p.action === action && p.resource === resource
      )
    )
      throw new AppError(403, "unAuthorized", true, "Permission denied");
    await permissionServices.adjustPermission(id, action, resource, "assign");
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
}

export async function revokePermission(req, res, next) {
  try {
    let allowedPermissions;
    const { id, action, resource } = req.body;
    if (req.auth.role === "root")
      allowedPermissions = roleTemplates.root_business;
    if (req.auth.role === "admin") allowedPermissions = roleTemplates.admin;

    if (
      !allowedPermissions.some(
        (p) => p.action === action && p.resource === resource
      )
    )
      throw new AppError(403, "unAuthorized", true, "Permission denied");
    await permissionServices.adjustPermission(id, action, resource, "revoke");
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
}
