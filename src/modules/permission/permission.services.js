import { Op } from "sequelize";
import db from "../../database/index.js";
import { AppError } from "../../utils/error.class.js";

const userAndPermission = async (id, resource, action) => {
  const user = await db.User.findByPk(id, {
    attributes: { exclude: ["password"] },
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
      {
        model: db.UserRole,
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
        userId: userId,
        permissionId: permission.id,
      },
    });
  } else if (effect === "assign") {
    const assignPermission = await db.UserPermission.create({
      userId: userId,
      permissionId: permission.id,
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
    return { userId: userId, permissionId: i.id };
  });
  if (!permissionsIds || permissionsIds.length < 1)
    throw new AppError(
      500,
      "failed to find permissions",
      false,
      "failed to find permissions",
    );
  const rules = await db.UserPermission.bulkCreate(permissions, {
    transaction: t,
  });
  if (!rules || rules.length < 1)
    throw new AppError(
      500,
      "failed to create permissions",
      false,
      "failed to create permissions",
    );
  return true;
};
async function getUserPermissions(id) {
  const permissions = await db.User.findOne({
    attributes: ["firstName"],
    where: { id },
    include: {
      model: db.Permission,
      as: "userToPermission",
      attributes: ["action", "resource"],
      through: {
        attributes: [],
      },
    },
  });
  return permissions.userToPermission;
}
const permissionServices = {
  initPermissions,
  adjustPermission,
  userAndPermission,
  getUserPermissions,
};

export default permissionServices;
