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
 * Please check the docs that i havent writen yet :D
 * @param {string} resource - The resource being accessed (e.g., "service", "asset",etc).
 * @param {string} action - The action being performed (e.g., "create", "read", "update","delete",etc).
 */
export const authorizeRequest =
  (resource, action) => async (req, res, next) => {
    const id = req.auth.id; // principal amroa
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
