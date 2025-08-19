import { roleTemplates } from "../database/templates.js";
import permissionServices from "../services/permission.services.js";
import { AppError } from "../utils/error.class.js";
import { hashIdDecode } from "../utils/hashId.util.js";
export async function assignPermission(req, res, next) {
  try {
    let allowedPermissions;
    const { id, action, resource } = req.body;
    switch (req.auth.role) {
      case "root":
        allowedPermissions = roleTemplates.root_business;
        break;
      case "admin":
        allowedPermissions = roleTemplates.admin;
        break;
      case "superAdmin":
        allowedPermissions = roleTemplates.admin;
        break;
      default:
        break;
    }
    if (
      !allowedPermissions.some(
        (p) => p.action === action && p.resource === resource
      )
    )
      throw new AppError(403, "unAuthorized", true, "Permission denied");
    await permissionServices.adjustPermission(
      hashIdDecode(id),
      action,
      resource,
      "assign"
    );
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
}

export async function revokePermission(req, res, next) {
  try {
    let allowedPermissions;
    const { id, action, resource } = req.body;
    switch (req.auth.role) {
      case "root":
        allowedPermissions = roleTemplates.root_business;
        break;
      case "admin":
        allowedPermissions = roleTemplates.admin;
        break;
      case "superAdmin":
        allowedPermissions = roleTemplates.admin;
        break;
      default:
        break;
    }
    if (
      !allowedPermissions.some(
        (p) => p.action === action && p.resource === resource
      )
    )
      throw new AppError(403, "unAuthorized", true, "Permission denied");
    await permissionServices.adjustPermission(
      hashIdDecode(id),
      action,
      resource,
      "revoke"
    );
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
}
export async function getUserPermissions(req, res, next) {
  try {
    const userPermission = await permissionServices.getUserPermissions(
      hashIdDecode(req.body.id)
    );
    res.send(userPermission);
  } catch (error) {
    next(error);
  }
}
export async function getPersonalPermissions(req, res, next) {
  try {
    const userPermission = await permissionServices.getUserPermissions(
      req.auth.id
    );
    res.send(userPermission);
  } catch (error) {
    next(error);
  }
}
export async function getAvailablePermissionsPermissions(req, res, next) {
  try {
    const userPermission = await permissionServices.getUserPermissions(
      req.auth.id
    );
    res.send(userPermission);
  } catch (error) {
    next(error);
  }
}
