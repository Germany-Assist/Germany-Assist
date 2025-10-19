import db from "../database/dbIndex.js";
import { validate as uuidValidate, version as uuidVersion } from "uuid";
import { AppError } from "./error.class.js";
import permissionServices from "../services/permission.services.js";
import hashIdUtil from "./hashId.util.js";
import { Model } from "sequelize";
function capitalizeFirstLetter(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}
async function checkRoleAndPermission(
  auth,
  targetRoles,
  requirePermission = false,
  resource = null,
  action = null
) {
  const userId = auth.id;
  const relatedId = auth.related_id;
  if (!userId) throw new AppError(500, "invalid parameters", false);
  if (!targetRoles || targetRoles.length < 1)
    throw new AppError(500, "invalid parameters", false);
  if (requirePermission && !(resource && action))
    throw new AppError(500, "invalid parameters", false);
  try {
    let hasPermission = true;
    const user = await permissionServices.userAndPermission(
      userId,
      requirePermission ? resource : null,
      requirePermission ? action : null
    );
    if (!user) throw new AppError(404, "Invalid User", false, "Unauthorized");
    if (requirePermission) {
      hasPermission = Boolean(user.userToPermission?.length);
    }

    //checking phase
    if (
      user.UserRole.role !== "super_admin" &&
      !targetRoles.includes("*") &&
      !targetRoles.includes(user.UserRole.role)
    )
      throw new AppError(403, "Improper Role", true, "Improper Role");
    if (!user.is_verified)
      throw new AppError(403, "Unverified User", true, "Unverified User");
    if (user.UserRole.related_id !== relatedId)
      throw new AppError(403, "Manipulated token", true, "forbidden");
    if (
      requirePermission &&
      !hasPermission &&
      user.UserRole.role !== "super_admin"
    )
      throw new AppError(403, "Permission Denied", true, "Permission Denied");
    return user;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(500, error, false, error.message);
  }
}

export async function checkOwnership(targetId, ownerId, resourceName) {
  if (!targetId) throw new AppError(422, "Missing Target Id", false);
  if (!ownerId) throw new AppError(422, "Missing Owner ID", false);
  if (!resourceName) throw new AppError(500, "Resource model required", false);
  if (ownerId === "super_admin") return;
  const resource = capitalizeFirstLetter(resourceName);
  let subject, actualOwner;
  try {
    let decodedTargetId = targetId;
    if (uuidValidate(targetId) && uuidVersion(targetId) === 4) {
      decodedTargetId = targetId;
    } else {
      decodedTargetId = hashIdUtil.hashIdDecode(targetId);
    }
    if (resource === "User") {
      subject = await db[resource].findByPk(decodedTargetId, {
        paranoid: false,
        include: { model: db.UserRole },
      });
      if (subject) actualOwner = subject.UserRole.related_id;
    } else {
      subject = await db[resource].findByPk(decodedTargetId, {
        paranoid: false,
      });
      if (!subject) {
        throw new AppError(404, "Resource not found", true, "Invalid resource");
      }
      actualOwner = subject.owner;
    }
    const isOwner = Boolean(actualOwner === ownerId);
    if (!isOwner) {
      throw new AppError(
        403,
        "Unauthorized ownership",
        true,
        "Unauthorized ownership"
      );
    }
    return subject;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(500, error.message, false, "Ownership check failed");
  }
}
const authUtil = { checkRoleAndPermission, checkOwnership };
export default authUtil;
