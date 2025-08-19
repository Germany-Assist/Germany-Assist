import { Op, where } from "sequelize";
import db from "../database/dbIndex.js";
import { AppError } from "../utils/error.class.js";

const userAndPermission = async (id, resource, action) => {
  const user = await db.User.findByPk(id, {
    include: [
      {
        model: db.Permission,
        as: "userToPermission",
        where: {
          resource,
          action,
        },
        required: false,
        attributes: ["id"],
      },
    ],
  });
  if (user) return user;
  return false;
};

const adjustPermission = async (userId, action, resource, effect) => {
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

const initPermissions = async (userId, template, t) => {
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

async function getUserPermissions(id) {
  const permissions = await db.User.findOne({
    where: { id },
    attributes: [],
    include: {
      model: db.Permission,
      as: "userToPermission",
      attributes: [
        ["action", "action"],
        ["resource", "resource"],
      ],
      through: {
        attributes: [],
      },
    },
  });
  return permissions.userToPermission;
}
export default {
  initPermissions,
  adjustPermission,
  userAndPermission,
  getUserPermissions,
};
