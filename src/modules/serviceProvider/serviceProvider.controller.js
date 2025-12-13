import serviceProviderServices from "./serviceProvider.services.js";
import { AppError } from "../../utils/error.class.js";
import { sequelize } from "../../configs/database.js";
import authUtils from "../../utils/authorize.util.js";
import userController, { cookieOptions } from "../user/user.controller.js";
import hashIdUtil from "../../utils/hashId.util.js";
export async function createServiceProvider(req, res, next) {
  const t = await sequelize.transaction();
  try {
    const hasPermission = await authUtils.checkRoleAndPermission(req.auth, [
      "admin",
      "super_admin",
    ]);
    const { email, password } = req.body;
    const profile = await serviceProviderServices.createServiceProvider(
      req.body,
      t
    );

    const { sanitizedUser, accessToken, refreshToken } =
      await userController.createRootAccount(
        email,
        password,
        profile.id,
        "serviceProvider",
        t
      );
    res
      .status(201)
      .cookie("refreshToken", refreshToken, cookieOptions)
      .json({ accessToken, user: sanitizedUser, serviceProvider: profile });
    await t.commit();
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
    const sanitizedSPProfile = {
      ...profile,
      services: profile.Services.map((i) => {
        return {
          title: i.title,
          rating: i.rating,
          image: i.image,
          id: hashIdUtil.hashIdEncode(i.id),
        };
      }),
    };
    delete sanitizedSPProfile.Services;
    res.status(200).json(sanitizedSPProfile);
  } catch (error) {
    next(error);
  }
}
export async function updateServiceProvider(req, res, next) {
  try {
    const hasPermission = await authUtils.checkRoleAndPermission(
      req.auth,
      ["service_provider_root", "super_admin"],
      true,
      "serviceProvider",
      "update"
    );

    const isOwner = await authUtils.checkOwnership(
      req.auth.related_id,
      req.auth.related_id,
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
      "email",
    ];
    const updateFields = {};
    allowedFields.forEach((field) => {
      if (req.body[field]) updateFields[field] = req.body[field];
    });
    const profile = await serviceProviderServices.updateServiceProvider(
      req.auth.related_id,
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
      req.auth,
      ["superAdmin", "admin"],
      true,
      "serviceProvider",
      "delete"
    );
    await serviceProviderServices.deleteServiceProvider(req.params.id);
    res.status(200).json({ message: "success" });
  } catch (error) {
    next(error);
  }
}
export async function restoreServiceProvider(req, res, next) {
  try {
    const hasPermission = await authUtils.checkRoleAndPermission(
      req.auth,
      ["superAdmin", "admin"],
      true,
      "serviceProvider",
      "delete"
    );
    const profile = await serviceProviderServices.restoreServiceProvider(
      req.params.id
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
