import { Op } from "sequelize";
import db from "../database/dbIndex.js";
import userServices from "../services/user.services.js";
import { AppError } from "../utils/error.class.js";
import { hasPermission } from "../services/permission.services.js";
export const authorizeRole = (targetRoles) => async (req, res, next) => {
  try {
    if (targetRoles.includes(req.auth.role)) {
      const user = await userServices.getUserById(req.auth.id);
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
      if (user.BusinessId !== req.auth.BusinessId)
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
 * @param {string} resource - The name of the Sequelize model to check ownership against.
 * @returns {Function} Express middleware function `(req, res, next)`.
 * @example
 * // Example: Only allow a user to update their own profile
 * router.put(
 *   "/users/:id",
 *   authorizeOwnership("user","User"),
 *   updateUserController
 * );
 * @note The `ownerId` is extracted from the authenticated user's token — it will be `id` for
 *   `ownerType: "user"` or `BusinessId` for `ownerType: "business"`.
 * @note The `targetId` is extracted from either the `id` field in `req.params` or `req.body` if both exist it will throw an error.
 */
export const authorizeOwnership =
  (ownerType, resource) => async (req, res, next) => {
    let ownerId;
    let targetId;
    if (ownerType === "business") {
      ownerId = req.auth.BusinessId;
    } else if (ownerType === "user") {
      ownerId = req.auth.id;
    } else {
      throw new AppError(
        500,
        "messing params for authorize Ownership function",
        false,
        "ops"
      );
    }

    if (req.body && req.body.id && req.params && req.params.id)
      throw new AppError(
        500,
        "conflict in the id attempt of bypassing",
        false,
        "ops"
      );
    targetId = req?.params?.id ?? req?.body?.id;
    if (!targetId)
      throw new AppError(
        500,
        "messing targetId for authorizeOwnership function",
        false,
        "ops"
      );
    const exist = await db[resource].findByPk(targetId);
    if (exist && exist.owner === ownerId) {
      next();
    } else {
      throw new AppError(
        403,
        `Unauthorized attempt by "${ownerId}" to resource "${resource}" wrong ownership`,
        true,
        `Unauthorized`
      );
    }
  };
