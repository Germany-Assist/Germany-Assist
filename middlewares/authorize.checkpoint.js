import db from "../database/dbIndex.js";
import { AppError } from "../utils/error.class.js";
import permissionServices from "../services/permission.services.js";
import { hashIdDecode } from "../utils/hashId.util.js";
import { validate as uuidValidate, version as uuidVersion } from "uuid";

export const authorizeRequest =
  (
    targetRoles,
    requirePermission,
    resource,
    action,
    requireOwner,
    ownerType,
    ownerResource
  ) =>
  async (req, res, next) => {
    if (targetRoles.length < 1)
      throw new AppError(500, "invalid parameters", false);
    if (requirePermission && !(resource && action))
      throw new AppError(500, "invalid parameters", false);
    if (requireOwner && !(ownerType && ownerResource))
      throw new AppError(500, "invalid parameters", false);
    try {
      let userId = req.auth.id;
      let hasPermission = true;
      let ownerId;
      let targetId;
      let isOwner = true;
      if (requireOwner) {
        if (ownerType === "business") {
          ownerId = req.auth.BusinessId;
        } else if (ownerType === "user") {
          ownerId = req.auth.id;
        }
        if (req.body?.id && req.params?.id && req.body.id !== req.params.id)
          throw new AppError(400, "Conflicting IDs", true, "forbidden");
        // i need to add decode im thinking of making a middleware
        targetId = req?.params?.id ?? req?.body?.id;
        if (!targetId) throw new AppError(422, "Missing Id", true, "ops");
        if (uuidValidate(targetId) && uuidVersion(targetId) === 4) {
          targetId = targetId;
        } else {
          targetId = hashIdDecode(targetId);
        }
        const subject = await db[ownerResource].findByPk(targetId);
        if (!subject)
          throw new AppError(404, "Invalid resource", true, "Invalid resource");
        isOwner = Boolean(subject && subject.owner === ownerId);
      }
      const user = await permissionServices.userAndPermission(
        userId,
        requirePermission ? resource : undefined,
        requirePermission ? action : undefined
      );
      if (!user) throw new AppError(404, "Invalid User", false, "Unauthorized");
      if (requirePermission) {
        hasPermission = Boolean(user.userToPermission?.length);
      }
      //checking phase
      if (!targetRoles.includes(user.role) && targetRoles[0] != "*")
        throw new AppError(403, "Improper Role", true, "Improper Role");
      if (!user.isVerified)
        throw new AppError(403, "Unverified User", true, "Unverified User");
      if (user.BusinessId !== req.auth.BusinessId)
        throw new AppError(403, "Manipulated token", true, "forbidden");
      if (!hasPermission && requirePermission && user.role !== "superAdmin")
        throw new AppError(403, "Unauthorized attempt", true, "forbidden");
      if (!isOwner && requireOwner && user.role !== "superAdmin") {
        throw new AppError(403, "Unauthorized Ownership", true, "Unauthorized");
      }
      next();
    } catch (error) {
      next(error);
    }
  };
