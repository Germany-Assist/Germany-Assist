import { OAuth2Client } from "google-auth-library";
import googleOAuthConfig from "../../configs/googleAuth.js";
import jwtUtils from "../../middlewares/jwt.middleware.js";
import userServices from "../user/user.services.js";
import permissionServices from "../permission/permission.services.js";
import userController, { cookieOptions } from "../user/user.controller.js";
import { roleTemplates } from "../../database/templates.js";
import { v4 as uuid } from "uuid";
import { sequelize } from "../../configs/database.js";
import db from "../../database/index.js";
import crypto from "crypto";
import { FRONTEND_URL } from "../../configs/serverConfig.js";
import { Op } from "sequelize";
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
      user = await userServices.createUser(
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
      .cookie("refreshToken", refreshToken, cookieOptions)
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
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const dbToken = await db.Token.findOne({
      where: {
        token: hashedToken,
        isValid: true,
        expiresAt: { [Op.gt]: new Date() },
      },
      raw: true,
      attributes: ["userId"],
    });
    if (!dbToken) return res.redirect(`${FRONTEND_URL}/verified?status=error`);
    await userServices.alterUserVerification(dbToken.userId, true);
    res.redirect(`${FRONTEND_URL}/verified?status=success`);
  } catch (error) {
    next(error);
  }
}
const authController = {
  googleAuthController,
  verifyAccount,
};

export default authController;
