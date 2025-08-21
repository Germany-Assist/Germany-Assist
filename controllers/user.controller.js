import { NODE_ENV, REFRESH_COOKIE_AGE } from "../configs/serverConfig.js";
import jwt from "../middlewares/jwt.middleware.js";
import { infoLogger } from "../utils/loggers.js";
import { hashPassword } from "../utils/bcrypt.util.js";
import { sequelize } from "../database/connection.js";
import permissionServices from "../services/permission.services.js";
import { roleTemplates } from "../database/templates.js";
import { hashIdDecode, hashIdEncode } from "../utils/hashId.util.js";
import authUtils from "../utils/authorize.requests.util.js";

import userServices from "../services/user.services.js";
export const createUserController =
  (role, is_root) => async (req, res, next) => {
    const t = await sequelize.transaction();
    await authUtils.authUtils.checkRoleAndPermission(
      req.auth.id,
      req.auth.BusinessId,
      ["superAdmin", "admin", "root_business"],
      true,
      "user",
      "create"
    );
    try {
      infoLogger(`creating new ${role}`);
      const { firstName, lastName, email, DOB, image } = req.body;
      const password = hashPassword(req.body.password);
      const user = await userServices.createUser(
        {
          firstName,
          lastName,
          email,
          password,
          DOB,
          image,
          role,
          is_root,
          BusinessId: role == "rep" ? req.auth.BusinessId : null,
          isVerified: role == "admin" ? true : false,
        },
        t
      );
      let permissionTemplate = [];
      switch (role) {
        case "rep":
          permissionTemplate = roleTemplates.rep_business;
          break;
        case "admin":
          permissionTemplate = roleTemplates.admin;
          break;
        case "client":
          permissionTemplate = roleTemplates.client;
          break;
        default:
          break;
      }
      await permissionServices.initPermissions(user.id, permissionTemplate, t);
      const { accessToken, refreshToken } = jwt.generateTokens(user);
      const sanitizedUser = {
        id: hashIdEncode(user.id),
        firstName: user.firstName,
        lastName: user.lastName,
        DOB: user.DOB,
        email: user.email,
        image: user.image,
        isVerified: user.isVerified,
        role: user.role,
        is_root: user.is_root,
        BusinessId: user.BusinessId,
      };
      res.status(201);
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: NODE_ENV === "production" ? true : false,
        sameSite: "strict",
        maxAge: REFRESH_COOKIE_AGE,
      });
      res.json({ accessToken, user: sanitizedUser });
      await t.commit();
    } catch (error) {
      await t.rollback();
      next(error);
    }
  };
export async function loginUserController(req, res, next) {
  try {
    const user = await userServices.loginUser(req.body);
    const { accessToken, refreshToken } = jwt.generateTokens(user);
    const sanitizedUser = {
      id: hashIdEncode(user.id),
      firstName: user.firstName,
      lastName: user.lastName,
      DOB: user.DOB,
      email: user.email,
      image: user.image,
      isVerified: user.isVerified,
      role: user.role,
      is_root: user.is_root,
      businessId: user.BusinessId,
    };
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: NODE_ENV === "production" ? true : false,
      sameSite: "strict",
      maxAge: REFRESH_COOKIE_AGE,
      path: "/api/user/refresh-token",
    });
    res.json({ accessToken, user: sanitizedUser });
  } catch (error) {
    next(error);
  }
}
//send me you refresh token cookie and shall give u new access token
export async function refreshUserToken(req, res, next) {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.sendStatus(401);
    }
    const user = jwt.verifyToken(refreshToken);
    const accessToken = jwt.generateAccessToken(user);
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: NODE_ENV === "production" ? true : false,
      sameSite: "strict",
      maxAge: REFRESH_COOKIE_AGE,
      path: "/api/user/refresh-token",
    });
    res.send({ accessToken });
  } catch (error) {
    next(error);
  }
}
//send me your token and i will send you your profile back
export async function loginUserTokenController(req, res, next) {
  try {
    const user = await userServices.getUserById(req.auth.id);
    const sanitizedUser = {
      id: hashIdEncode(user.id),
      firstName: user.firstName,
      lastName: user.lastName,
      DOB: user.DOB,
      email: user.email,
      image: user.image,
      isVerified: user.isVerified,
      role: user.role,
      is_root: user.is_root,
      businessId: user.BusinessId,
    };
    res.send(sanitizedUser);
  } catch (error) {
    next(error);
  }
}

export async function getAllUsers(req, res, next) {
  try {
    await authUtils.checkRoleAndPermission(
      req.auth.id,
      req.auth.BusinessId,
      ["admin", "superAdmin"],
      true,
      "user",
      "read"
    );
    const users = await userServices.getAllUsers();
    const usersWithIds = users.map((e) => {
      return { ...e, id: hashIdEncode(e.id) };
    });
    res.send(usersWithIds);
  } catch (error) {
    next(error);
  }
}
export async function getBusinessReps(req, res, next) {
  try {
    await authUtils.checkRoleAndPermission(
      req.auth.id,
      req.auth.BusinessId,
      ["root_business", "rep"],
      true,
      "user",
      "read"
    );
    const users = await userServices.getBusinessReps(req.auth.BusinessId);
    const usersWithIds = users.map((e) => {
      return { ...e, id: hashIdEncode(e.id) };
    });
    res.send(usersWithIds);
  } catch (error) {
    next(error);
  }
}

export async function verifyUser(req, res, next) {
  try {
    await authUtils.checkRoleAndPermission(
      req.auth.id,
      req.auth.BusinessId,
      ["admin", "superAdmin"],
      true,
      "user",
      "verify"
    );
    await userServices.alterUserVerification(hashIdDecode(req.params.id), true);
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
}
