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

export const adjustPermission = async (userId, action, resource, effect) => {
  const permission = await db.Permission.findOne({
    where: { action, resource },
  });
  if (!permission)
    throw new AppError(404, "no permission found", true, "not found");

  if (effect === "revoke") {
    const revokePermission = await db.UserPermission.destroy({
      where: {
        UserId: userId,
        PermissionId: permission.id,
      },
    });
  } else if (effect === "assign") {
    const assignPermission = await db.UserPermission.create({
      UserId: userId,
      PermissionId: permission.id,
    });
  }
};

export const initPermissions = async (userId, template, t) => {
  const permissionsIds = await db.Permission.findAll({
    where: {
      [Op.or]: template,
    },
    attributes: ["id"],
  });
  const permissions = permissionsIds.map((i) => {
    return { UserId: userId, PermissionId: i.id };
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
