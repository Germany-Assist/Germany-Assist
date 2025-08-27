import serviceProviderServices from "../services/serviceProvider.services.js";
import { AppError } from "../utils/error.class.js";
import userServices from "../services/user.services.js";
import bcryptUtil from "../utils/bcrypt.util.js";
import jwt from "../middlewares/jwt.middleware.js";
import { sequelize } from "../database/connection.js";
import { NODE_ENV, REFRESH_COOKIE_AGE } from "../configs/serverConfig.js";
import permissionServices from "../services/permission.services.js";
import { roleTemplates } from "../database/templates.js";
import hashIdUtil from "../utils/hashId.util.js";
import authUtils from "../utils/authorize.util.js";

export async function createServiceProvider(req, res, next) {
  const t = await sequelize.transaction();
  try {
    const { email } = req.body;
    const password = bcryptUtil.hashPassword(req.body.password);
    const profile = await serviceProviderServices.createServiceProvider(
      req.body,
      t
    );
    const user = await userServices.createUser(
      {
        first_name: "serviceProvider",
        last_name: "root",
        email,
        password,
      },
      t
    );
    const role = await userServices.createUserRole(
      user.id,
      "service_provider_root",
      "ServiceProvider",
      profile.id,
      t
    );
    const root_permissions = await permissionServices.initPermissions(
      user.id,
      roleTemplates.root_serviceProvider,
      t
    );
    const sanitizedUser = {
      id: hashIdUtil.hashIdEncode(user.id),
      first_name: user.first_name,
      last_name: user.last_name,
      dob: user.dob,
      email: user.email,
      image: user.image,
      is_verified: user.is_verified,
      role: role.role,
      related_type: role.related_type,
      related_id: role.related_id,
    };
    if (!root_permissions)
      throw new AppError(500, "failed to create permissions", false);
    const { accessToken, refreshToken } = jwt.generateTokens(
      user.id,
      role.role,
      role.related_type,
      role.related_id
    );
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: NODE_ENV === "production" ? true : false,
      sameSite: "strict",
      maxAge: REFRESH_COOKIE_AGE,
      path: "/api/user/refresh-token",
    });
    await t.commit();
    res
      .status(201)
      .json({ accessToken, user: sanitizedUser, serviceProvider: profile });
  } catch (error) {
    await t.rollback();
    next(error);
  }
}
export async function getAllServiceProvider(req, res, next) {
  try {
    const profiles = await serviceProviderServices.getAllServiceProvider();
    res.status(200).json(profiles);
  } catch (error) {
    next(error);
  }
}
export async function getServiceProviderById(req, res, next) {
  try {
    const profile = await serviceProviderServices.getServiceProviderById(
      req.params.id
    );
    res.status(200).json(profile);
  } catch (error) {
    next(error);
  }
}
export async function updateServiceProvider(req, res, next) {
  try {
    const hasPermission = await authUtils.checkRoleAndPermission(
      req.auth.id,
      req.auth.service_provider,
      ["service_provider_root", "superAdmin"],
      true,
      "serviceProvider",
      "update"
    );
    const isOwner = await authUtils.checkOwnership(
      req.body.id,
      req.auth.service_provider,
      "ServiceProvider"
    );
    if (!hasPermission || !isOwner)
      throw new AppError(403, "UnAuthorized", true, "UnAuthorized");
    const allowedFields = [
      "name",
      "about",
      "description",
      "phone_number",
      "image",
    ];
    const updateFields = {};
    allowedFields.forEach((field) => {
      if (req.body[field]) updateFields[field] = req.body[field];
    });
    const profile = await serviceProviderServices.updateServiceProvider(
      req.body.id,
      updateFields
    );
    res.status(200).json(profile);
  } catch (error) {
    next(error);
  }
}
export async function deleteServiceProvider(req, res, next) {
  try {
    const hasPermission = await authUtils.checkRoleAndPermission(
      req.auth.id,
      req.auth.service_provider_id,
      ["service_provider_root", "superAdmin", "admin"],
      true,
      "serviceProvider",
      "delete"
    );
    const isOwner = await authUtils.checkOwnership(
      req.body.id,
      req.auth.service_provider_id,
      "ServiceProvider"
    );
    if (!hasPermission || !isOwner)
      throw new AppError(403, "UnAuthorized", true, "UnAuthorized");
    await serviceProviderServices.deleteServiceProvider(req.body.id);
    res.status(200).json({ message: "success" });
  } catch (error) {
    next(error);
  }
}
export async function restoreServiceProvider(req, res, next) {
  try {
    const hasPermission = await authUtils.checkRoleAndPermission(
      req.auth.id,
      req.auth.service_provider_id,
      ["superAdmin", "admin"],
      true,
      "serviceProvider",
      "delete"
    );
    if (!hasPermission)
      throw new AppError(403, "UnAuthorized", true, "UnAuthorized");
    const profile = await serviceProviderServices.restoreServiceProvider(
      req.body.id
    );
    res.status(200).json(profile);
  } catch (error) {
    next(error);
  }
}
const serviceProviderController = {
  restoreServiceProvider,
  deleteServiceProvider,
  updateServiceProvider,
  getServiceProviderById,
  getAllServiceProvider,
  createServiceProvider,
};
export default serviceProviderController;
