import businessServices from "../services/business.services.js";
import { AppError } from "../utils/error.class.js";
import userServices from "../services/user.services.js";
import { hashPassword } from "../utils/bycrypt.util.js";
import { generateTokens } from "../middlewares/jwt.middleware.js";
import { sequelize } from "../database/connection.js";
import { NODE_ENV } from "../configs/serverConfig.js";
import permissionServices from "../services/permission.services.js";
import { roleTemplates } from "../database/templates.js";
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
      id: user.id,
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
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
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
    if (error instanceof AppError) error.appendTrace(req.requestId);
    next(error);
  }
}
export async function getBusinessById(req, res, next) {
  try {
    const profile = await businessServices.getBusinessById(req.params.id);
    res.status(200).json(profile);
  } catch (error) {
    if (error instanceof AppError) error.appendTrace(req.requestId);
    next(error);
  }
}
export async function updateBusiness(req, res, next) {
  try {
    const { name, about, description, email, phone_number, image } = req.body;
    const list = [name, about, description, email, phone_number, image];
    const updateFields = {};

    list.forEach((e) => {
      if (e) updateFields[e] = e;
    });

    const profile = await businessServices.updateBusiness(
      parseInt(req.params.id),
      updateFields
    );
    res.status(200).json(profile);
  } catch (error) {
    if (error instanceof AppError) error.appendTrace(req.requestId);
    next(error);
  }
}
export async function deleteBusiness(req, res, next) {
  console.log("attempt of delete");
  try {
    const result = await businessServices.deleteBusiness(req.params.id);
    res.sendStatus(200);
  } catch (error) {
    if (error instanceof AppError) error.appendTrace(req.requestId);
    next(error);
  }
}
export async function restoreBusiness(req, res, next) {
  try {
    const profile = await businessServices.restoreBusiness(
      parseInt(req.params.id)
    );
    res.status(200).json(profile);
  } catch (error) {
    if (error instanceof AppError) error.appendTrace(req.requestId);
    next(error);
  }
}
