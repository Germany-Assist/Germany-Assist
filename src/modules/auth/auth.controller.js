import { OAuth2Client } from "google-auth-library";
import googleOAuthConfig from "../../configs/googleAuth.js";
import jwtUtils from "../../middlewares/jwt.middleware.js";
import userServices from "../user/user.services.js";
import permissionServices from "../permission/permission.services.js";
import userController from "../user/user.controller.js";
import { roleTemplates } from "../../database/templates.js";
import { v4 as uuid } from "uuid";
import { sequelize } from "../../configs/database.js";
import db from "../../database/index.js";
import crypto from "crypto";
import { FRONTEND_URL } from "../../configs/serverConfig.js";
import { Op } from "sequelize";
import userDomain from "../user/user.domain.js";
import authServices from "./auth.service.js";
import { AppError } from "../../utils/error.class.js";
import authUtil from "../../utils/authorize.util.js";
import hashIdUtil from "../../utils/hashId.util.js";
import userRepository from "../user/user.repository.js";
const client = new OAuth2Client(googleOAuthConfig.clientId);

async function googleAuthController(req, res) {
  const t = await sequelize.transaction();
  const { credential } = req.body;
  let status = 200;
  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: googleOAuthConfig.clientId,
    });
    const payload = ticket.getPayload();
    const email = payload.email;
    let user = await userServices.getUserByEmail(email);
    if (!user) {
      status = 201;
      user = await userRepository.createUser(
        {
          email: payload.email,
          firstName: payload.given_name || null,
          lastName: payload.family_name || null,
          email: payload.email,
          profilePicture: {
            name: uuid(),
            mediaType: "image",
            url: payload.picture,
            size: 0,
          },
          isVerified: true,
          googleId: payload.sub,
          UserRole: {
            role: "client",
            relatedType: "client",
            relatedId: null,
          },
        },
        t
      );
      await permissionServices.initPermissions(
        user.id,
        roleTemplates.client,
        t
      );
    }
    const { accessToken, refreshToken } = jwtUtils.generateTokens(user);
    const sanitizedUser = await userController.sanitizeUser(user);
    res
      .cookie("refreshToken", refreshToken, userDomain.cookieOptions)
      .status(status)
      .json({ accessToken, user: sanitizedUser });
    await t.commit();
  } catch (error) {
    await t.rollback();
    next(error);
  }
}

export async function verifyAccount(req, res, next) {
  try {
    const token = req.query.token;
    const success = await authServices.verifyAccount(token);
    if (!success) return res.redirect(`${FRONTEND_URL}/verified?status=error`);
    res.redirect(`${FRONTEND_URL}/verified?status=success`);
  } catch (error) {
    next(error);
  }
}
export async function login(req, res, next) {
  try {
    const results = await authServices.loginUser(req.body);
    res
      .cookie("refreshToken", results.refreshToken, userDomain.cookieOptions)
      .status(200)
      .json({ accessToken: results.accessToken, user: results.user });
  } catch (error) {
    next(error);
  }
}
export async function loginToken(req, res, next) {
  try {
    const user = await authServices.loginToken(req.auth);
    res.send(user);
  } catch (error) {
    next(error);
  }
}
export async function verifyUserManual(req, res, next) {
  try {
    await authUtil.checkRoleAndPermission(
      req.auth,
      ["admin", "super_admin"],
      true,
      "user",
      "verify"
    );
    await authServices.alterUserVerification(req.params.id, true);
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
}

export async function refreshUserToken(req, res, next) {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      throw new AppError(401, "missing cookie", true, "missing cookie");
    }
    const accessToken = await authServices.refreshUserToken(refreshToken);
    res.send({ accessToken });
  } catch (error) {
    next(error);
  }
}
export async function getUserProfile(req, res, next) {
  try {
    const user = await authServices.getUserProfile(req.auth.id);
    res.send(user);
  } catch (error) {
    next(error);
  }
}
const authController = {
  googleAuthController,
  getUserProfile,
  verifyAccount,
  login,
  loginToken,
  verifyUserManual,
  refreshUserToken,
};

export default authController;
