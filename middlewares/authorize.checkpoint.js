import { Op } from "sequelize";
import db from "../database/dbIndex.js";
import { getUserById } from "../services/user.services.js";
import { AppError } from "../utils/error.class.js";
import { hasPermission } from "../services/permission.services.js";
export const authorizeRole = (targetRoles) => async (req, res, next) => {
  try {
    if (targetRoles.includes(req.auth.role)) {
      const user = await getUserById(req.auth.id);
      if (!user.isVerified)
        throw new AppError(
          403,
          "the account is not activated",
          true,
          "the account is not activated",
          undefined,
          req.requestId
        );
      if (!targetRoles.includes(user.role))
        throw new AppError(
          403,
          "the account doest have the proper role",
          true,
          "the account  doest have the proper role",
          undefined,
          req.requestId
        );
      if (!user.BusinessId === req.auth.BusinessId)
        throw new AppError(
          403,
          "mismatch data between the token and the database ",
          true,
          "unauthorized",
          undefined,
          req.requestId
        );
      next();
    } else {
      const err = new AppError(
        403,
        `Unauthorized attempt to access`,
        true,
        "Unauthorized",
        undefined,
        req.requestId
      );
      next(err);
    }
  } catch (error) {
    next(error);
  }
};
/**
 * Checks if a user is authorized to perform an action on a resource.
 * Please check the docs that i haven't written yet :D
 * @param {string} resource - The resource being accessed (e.g., "service", "asset",etc).
 * @param {string} action - The action being performed (e.g., "create", "read", "update","delete",etc).
 * @param {boolean} owner - Check the ownership of the resources (true,false).
 * @param {string} ownerField - Check for the owner field in the specific id.
 *
 */
export const authorizeRequest =
  (resource, action) => async (req, res, next) => {
    const id = req.auth.id;
    const role = req.auth.role;
    const BusinessId = req.auth.BusinessId;
    try {
      const permission = await hasPermission(
        id,
        role,
        BusinessId,
        resource,
        action
      );
      if (!permission)
        throw new AppError(
          403,
          `Unauthorized attempt by ${id} to resource ${resource} action ${action}`,
          true,
          `Unauthorized you cant perform ${action} on ${resource}`,
          undefined,
          req.requestId
        );

      next();
    } catch (error) {
      next(error);
    }
  };
/**
 * Express middleware factory that checks whether the authenticated user
 * owns a specific resource before allowing the request to proceed.
 *
 * @param {string} ownerType - The type of owner. Can be either `"user"` or `"business"`.
 * @param {string} ownerField - The name of the database field in the resource table
 *   that stores the owner ID (e.g., `"BusinessId"`, `"UserId"`, `"id"` for self-owned profiles).
 * @param {string} resource - The name of the Sequelize model to check ownership against.
 *
 * @throws {AppError} - 500 if `ownerType` or `targetId` is missing,
 *   403 if the authenticated user does not own the target resource.
 *
 * @returns {Function} Express middleware function `(req, res, next)`.
 *
 * @example
 * // Example: Only allow a user to update their own profile
 * router.put(
 *   "/users/:id",
 *   authorizeOwnership("user", "id", "User"),
 *   updateUserController
 * );
 *
 *
 * @note The `ownerField` in the `resource` model must match the `ownerId` for ownership to be valid.
 * @note The `ownerId` is extracted from the authenticated user's token — it will be `id` for
 *   `ownerType: "user"` or `BusinessId` for `ownerType: "business"`.
 * @note The `targetId` is extracted from either the `id` field in `req.params` or `req.body`.
 */
export const authorizeOwnership =
  (ownerType, ownerField, resource) => async (req, res, next) => {
    let ownerId;
    let targetId;
    if (ownerType === "business") {
      ownerId = req.auth.BusinessId;
    } else if (ownerType === "user") {
      ownerId = req.auth.id;
    } else {
      throw new AppError(
        500,
        "messing ownerType for authorizeOwnership function",
        false,
        "ops"
      );
    }
    targetId = req?.params?.id ?? req?.body?.id;
    if (!targetId)
      throw new AppError(
        500,
        "messing targetId for authorizeOwnership function",
        false,
        "ops"
      );
    const isOwner = await db[resource].findOne({
      where: { id: targetId, [ownerField]: ownerId },
    });
    if (!isOwner)
      throw new AppError(
        403,
        `Unauthorized attempt by ${ownerId} to resource ${resource}`,
        true,
        `Unauthorized`
      );
    next();
  };
