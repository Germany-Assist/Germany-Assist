import { OAuth2Client } from "google-auth-library";
import googleOAuthConfig from "../configs/googleAuth.js";
import jwtUtils from "../middlewares/jwt.middleware.js";
import userServices from "../services/user.services.js";
import permissionServices from "../services/permission.services.js";
import userController, {
  cookieOptions,
} from "../controllers/user.controller.js";
import { roleTemplates } from "../database/templates.js";
import { v4 as uuid } from "uuid";
import { sequelize } from "../database/connection.js";
import { errorLogger } from "../utils/loggers.js";

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
          first_name: payload.given_name || null,
          last_name: payload.family_name || null,
          email: payload.email,
          profilePicture: {
            name: uuid(),
            media_type: "image",
            url: payload.picture,
            size: 0,
          },
          is_verified: true,
          googleId: payload.sub,
          UserRole: {
            role: "client",
            related_type: "client",
            related_id: null,
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
const authController = {
  googleAuthController,
};

export default authController;
