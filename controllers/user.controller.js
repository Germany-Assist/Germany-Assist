import { NODE_ENV, REFRESH_COOKIE_AGE } from "../configs/serverConfig.js";
import userServices from "../services/user.services.js";
import {
  generateAccessToken,
  generateTokens,
  verifyToken,
} from "../middlewares/jwt.middleware.js";
import { infoLogger } from "../utils/loggers.js";
import { hashPassword } from "../utils/bycrypt.util.js";
import { sequelize } from "../database/connection.js";
import permissionServices from "../services/permission.services.js";
import { roleTemplates } from "../database/templates.js";
import { hashIdEncode } from "../utils/hashId.util.js";

export const createUserController =
  (role, is_root) => async (req, res, next) => {
    const t = await sequelize.transaction();
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
      const { accessToken, refreshToken } = generateTokens(user);
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
    const { accessToken, refreshToken } = generateTokens(user);
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
    const user = verifyToken(refreshToken);
    const accessToken = generateAccessToken(user);
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
export async function activateUser(req, res, next) {
  try {
    await userServices.alterUserVerification(req.params.id, true);
    res.send(200);
  } catch (error) {
    next(error);
  }
}

export async function getAllUsers(req, res, next) {
  try {
    const users = await userServices.getAllUsers();
    const usersWithIds = users.map((e) => {
      return { ...e, id: hashIdEncode(e.id) };
    });
    res.send(usersWithIds);
  } catch (error) {
    next(error);
  }
}
export async function getAllRepsScope(req, res, next) {
  try {
    const users = await userServices.getAllRepsScope(req.auth.BusinessId);
    const usersWithIds = users.map((e) => {
      return { ...e, id: hashIdEncode(e.id) };
    });
    res.send(usersWithIds);
  } catch (error) {
    next(error);
  }
}
