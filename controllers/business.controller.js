import businessServices from "../services/business.services.js";
import { AppError } from "../utils/error.class.js";
import userServices from "../services/user.services.js";
import { hashPassword } from "../utils/bycrypt.util.js";
import { generateTokens } from "../middlewares/jwt.middleware.js";
import { sequelize } from "../database/connection.js";
import { NODE_ENV, REFRESH_COOKIE_AGE } from "../configs/serverConfig.js";
import permissionServices from "../services/permission.services.js";
import { roleTemplates } from "../database/templates.js";
import { hashIdEncode } from "../utils/hashId.util.js";
export async function createBusiness(req, res, next) {
  const t = await sequelize.transaction();
  try {
    const { email } = req.body;
    const password = hashPassword(req.body.password);
    const profile = await businessServices.createBusiness(req.body, t);
    const user = await userServices.createUser(
      {
        firstName: "business",
        lastName: "root",
        email,
        password,
        role: "root",
        BusinessId: profile.id,
        is_root: true,
      },
      t
    );

    const sanitizedUser = {
      id: hashIdEncode(user.id),
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      image: user.image,
      isVerified: user.isVerified,
      role: user.role,
      is_root: user.is_root,
      BusinessId: user.BusinessId,
    };
    await permissionServices.initPermissions(
      user.id,
      roleTemplates.root_business,
      t
    );
    const { accessToken, refreshToken } = generateTokens(user);
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: NODE_ENV === "production" ? true : false,
      sameSite: "strict",
      maxAge: REFRESH_COOKIE_AGE,
    });
    await t.commit();
    res
      .status(201)
      .json({ accessToken, user: sanitizedUser, business: profile });
  } catch (error) {
    await t.rollback();
    next(error);
  }
}
export async function getAllBusiness(req, res, next) {
  try {
    const profiles = await businessServices.getAllBusiness();
    res.status(200).json(profiles);
  } catch (error) {
    next(error);
  }
}
export async function getBusinessById(req, res, next) {
  try {
    const profile = await businessServices.getBusinessById(req.params.id);
    res.status(200).json(profile);
  } catch (error) {
    next(error);
  }
}
export async function updateBusiness(req, res, next) {
  try {
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
    const profile = await businessServices.updateBusiness(
      req.body.id,
      updateFields
    );
    res.status(200).json(profile);
  } catch (error) {
    next(error);
  }
}
export async function deleteBusiness(req, res, next) {
  try {
    const result = await businessServices.deleteBusiness(req.body.id);
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
}
export async function restoreBusiness(req, res, next) {
  try {
    const profile = await businessServices.restoreBusiness(req.body.id);
    res.status(200).json(profile);
  } catch (error) {
    next(error);
  }
}
