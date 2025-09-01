import { loginUserTokenController } from "../../controllers/user.controller.js";
import db from "../../database/dbIndex.js";
import jwtMiddleware from "../../middlewares/jwt.middleware.js";
import bcryptUtil from "../../utils/bcrypt.util.js";
import { errorLogger } from "../../utils/loggers.js";
import { v4 as uuidv4 } from "uuid";
export async function userFactory(overrides = {}) {
  const processedOverrides = {
    ...overrides,
    ...(overrides.password && {
      password: bcryptUtil.hashPassword(overrides.password),
    }),
  };
  try {
    const defaults = {
      first_name: "John",
      last_name: "Doe",
      email: overrides.email || `user+${uuidv4()}@test.com`,
      password: bcryptUtil.hashPassword("123456@AbcsQQ"),
      UserRole: {
        role: "client",
        related_type: "client",
        related_id: null,
        is_verified: false,
      },
    };
    return await db.User.create(
      { ...defaults, ...processedOverrides },
      { include: { model: db.UserRole } }
    );
  } catch (error) {
    errorLogger(error);
  }
}

export async function userWithTokenFactory(userData) {
  const user = await userFactory(user);
  const { accessToken, refreshToken } = jwtMiddleware.generateTokens(user);
  return { user, accessToken };
}
