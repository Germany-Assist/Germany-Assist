import { Op } from "sequelize";
import db from "../database/dbIndex.js";
import { AppError } from "../utils/error.class.js";

export const hasPermission = async (id, role, BusinessId, resource, action) => {
  const permission = await db.User.findOne({
    where: { id, role, BusinessId },
    include: [
      {
        model: db.Permission,
        as: "userToPermission",
        where: {
          resource,
          action,
        },
        required: true,
      },
    ],
  });
  if (permission) return true;
  return false;
};

export const adjustPermission = async (userId, permissionId, effect) => {
  if (effect === "revoke") {
    const permission = await db.UserPermission.destroy({
      where: {
        UserId: userId,
        PermissionId: permissionId,
      },
    });
  } else if (effect === "assign") {
    const permission = await db.UserPermission.create({
      UserId: userId,
      PermissionId: permissionId,
    });
  }
};

export const initPermissions = async (userId, template, t) => {
  const permissions = template.map((i) => {
    return { UserId: userId, PermissionId: i };
  });
  const rules = await db.UserPermission.bulkCreate(permissions, {
    transaction: t,
  });
  if (!rules)
    throw new AppError(
      500,
      "failed to create permissions",
      false,
      "failed to create permissions"
    );
  return true;
};
export default { initPermissions, adjustPermission, hasPermission };
