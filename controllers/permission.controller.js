import { roleTemplates } from "../database/templates.js";
import permissionServices from "../services/permission.services.js";
import authUtils from "../utils/authorize.requests.util.js";
import { AppError } from "../utils/error.class.js";
import { hashIdDecode } from "../utils/hashId.util.js";

function getAllowedPermissions(role) {
  switch (role) {
    case "root_business":
      return roleTemplates.root_business;
    case "superAdmin":
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

function extractPermissionData(req, requireId = true) {
  const { id, action, resource } = req.body;
  if (!action || !resource) {
    throw new AppError(
      400,
      "Missing action or resource",
      true,
      "Invalid request"
    );
  }
  if (requireId && !id) {
    throw new AppError(400, "Missing user ID", true, "Invalid request");
  }
  return { id, action, resource };
}

export async function assignPermission(req, res, next) {
  try {
    const hasPermission = await authUtils.checkRoleAndPermission(
      req.auth.id,
      req.auth.BusinessId,
      ["root_business", "superAdmin"],
      true,
      "permission",
      "assign"
    );
    if (!hasPermission) {
      throw new AppError(403, "Permission denied", true, "Permission denied");
    }
    const { id, action, resource } = extractPermissionData(req);
    const decodedId = hashIdDecode(id);
    const isOwner = await checkOwnership(
      decodedId,
      req.auth.BusinessId,
      "User"
    );
    if (!isOwner) {
      throw new AppError(
        403,
        "Ownership check failed",
        true,
        "Permission denied"
      );
    }

    const allowedPermissions = getAllowedPermissions(req.auth.role);
    validatePermissionAction(allowedPermissions, action, resource);

    await permissionServices.adjustPermission(
      decodedId,
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
    const hasPermission = await authUtils.checkRoleAndPermission(
      req.auth.id,
      req.auth.BusinessId,
      ["root_business", "superAdmin"],
      true,
      "permission",
      "revoke"
    );

    if (!hasPermission) {
      throw new AppError(403, "Permission denied", true, "Permission denied");
    }
    const { id, action, resource } = extractPermissionData(req);
    const decodedId = hashIdDecode(id);
    const isOwner = await checkOwnership(
      decodedId,
      req.auth.BusinessId,
      "User"
    );
    if (!isOwner) {
      throw new AppError(
        403,
        "Ownership check failed",
        true,
        "Permission denied"
      );
    }
    const allowedPermissions = getAllowedPermissions(req.auth.role);
    validatePermissionAction(allowedPermissions, action, resource);
    await permissionServices.adjustPermission(
      decodedId,
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
      req.auth.id,
      req.auth.BusinessId,
      ["root_business", "superAdmin"],
      true,
      "permission",
      "list"
    );
    if (!hasPermission) {
      throw new AppError(403, "Permission denied", true, "Permission denied");
    }
    const { id } = req.body;
    if (!id) {
      throw new AppError(422, "Missing user ID", true, "Invalid request");
    }
    const decodedId = hashIdDecode(id);
    const isOwner = await authUtils.checkOwnership(
      decodedId,
      req.auth.BusinessId,
      "User"
    );
    if (!isOwner) {
      throw new AppError(
        403,
        "Ownership check failed",
        true,
        "Permission denied"
      );
    }
    const userPermissions = await permissionServices.getUserPermissions(
      decodedId
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
      req.auth.id,
      req.auth.BusinessId,
      ["root_business", "superAdmin", "admin", "user"],
      false
    );
    if (!hasPermission) {
      throw new AppError(403, "Permission denied", true, "Permission denied");
    }
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
    const hasPermission = await authUtils.checkRoleAndPermission(
      req.auth.id,
      req.auth.BusinessId,
      ["*"],
      false
    );
    if (!hasPermission) {
      throw new AppError(403, "Permission denied", true, "Permission denied");
    }
    const availablePermissions = getAllowedPermissions(req.auth.role);
    res.status(200).json({
      success: true,
      data: availablePermissions,
    });
  } catch (error) {
    next(error);
  }
}
