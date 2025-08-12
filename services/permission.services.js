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

export const assignPermission = async (userId, permissionId) => {
  const permission = await db.UserPermission.create({
    UserId: userId,
    PermissionId: permissionId,
  });
};

export const initPermissions = async (userId, template, t) => {
  const permissions = template.map((i) => {
    return { UserId: userId, PermissionId: i };
  });
  const rules = await db.UserPermission.bulkCreate(permissions, {
    transaction: t,
  });
};
