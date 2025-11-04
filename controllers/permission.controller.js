import { roleTemplates } from "../database/templates.js";
import permissionServices from "../services/permission.services.js";
import authUtils from "../utils/authorize.util.js";
import { AppError } from "../utils/error.class.js";
import hashIdUtil from "../utils/hashId.util.js";

function getAllowedPermissions(role) {
  switch (role) {
    case "client":
      return roleTemplates.client;
    case "service_provider_rep":
      return roleTemplates.service_provider_rep;
    case "service_provider_root":
      return roleTemplates.service_provider_root;
    case "super_admin":
      return ["*"];
    case "admin":
      return roleTemplates.admin;
    default:
      throw new AppError(403, "Unauthorized role", true, "Permission denied");
  }
}
function validatePermissionAction(allowedPermissions, action, resource) {
  const isValid = allowedPermissions.some(
    (p) => p.action === action && p.resource === resource
  );
  if (!isValid) {
    throw new AppError(
      403,
      "Unauthorized permission action",
      true,
      "Permission denied"
    );
  }
}
export async function assignPermission(req, res, next) {
  try {
    const { id, action, resource } = req.body;
    const targetUserId = hashIdUtil.hashIdDecode(id);

    await authUtils.checkRoleAndPermission(
      req.auth,
      ["service_provider_root", "super_admin"],
      true,
      "permission",
      "assign"
    );

    await authUtils.checkOwnership(id, req.auth.related_id, "User");

    const allowedPermissions = getAllowedPermissions(req.auth.role);

    validatePermissionAction(allowedPermissions, action, resource);

    await permissionServices.adjustPermission(
      targetUserId,
      action,
      resource,
      "assign"
    );
    res.status(200).json({
      success: true,
      message: "Permission assigned successfully",
    });
  } catch (error) {
    next(error);
  }
}

export async function revokePermission(req, res, next) {
  try {
    const { id, action, resource } = req.body;
    const targetUserId = hashIdUtil.hashIdDecode(id);

    await authUtils.checkRoleAndPermission(
      req.auth,
      ["service_provider_root", "super_admin"],
      true,
      "permission",
      "assign"
    );

    await authUtils.checkOwnership(id, req.auth.related_id, "User");
    const allowedPermissions = getAllowedPermissions(req.auth.role);
    validatePermissionAction(allowedPermissions, action, resource);

    await permissionServices.adjustPermission(
      targetUserId,
      action,
      resource,
      "revoke"
    );
    res.status(200).json({
      success: true,
      message: "Permission revoked successfully",
    });
  } catch (error) {
    next(error);
  }
}

export async function getUserPermissions(req, res, next) {
  try {
    const hasPermission = await authUtils.checkRoleAndPermission(
      req.auth,
      ["service_provider_root", "super_admin"],
      true,
      "permission",
      "list"
    );
    const { id } = req.params;
    await authUtils.checkOwnership(id, req.auth.related_id, "User");
    const userPermissions = await permissionServices.getUserPermissions(
      hashIdUtil.hashIdDecode(id)
    );
    res.status(200).json({
      success: true,
      data: userPermissions,
    });
  } catch (error) {
    next(error);
  }
}

export async function getPersonalPermissions(req, res, next) {
  try {
    const hasPermission = await authUtils.checkRoleAndPermission(
      req.auth,
      [
        "service_provider_root",
        "super_admin",
        "admin",
        "client",
        "service_provider_rep",
      ],
      false
    );
    const userPermissions = await permissionServices.getUserPermissions(
      req.auth.id
    );
    res.status(200).json({
      success: true,
      data: userPermissions,
    });
  } catch (error) {
    next(error);
  }
}

export async function getAvailablePermissions(req, res, next) {
  try {
    const availablePermissions = getAllowedPermissions(req.auth.role);
    res.status(200).json({
      success: true,
      data: availablePermissions,
    });
  } catch (error) {
    next(error);
  }
}
const permissionController = {
  getAvailablePermissions,
  getPersonalPermissions,
  getUserPermissions,
  revokePermission,
  assignPermission,
  validatePermissionAction,
  getAllowedPermissions,
};
export default permissionController;
