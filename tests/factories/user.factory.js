import db from "../../database/dbIndex.js";
import jwtMiddleware from "../../middlewares/jwt.middleware.js";
import bcryptUtil from "../../utils/bcrypt.util.js";
import { errorLogger } from "../../utils/loggers.js";
import { v4 as uuidv4 } from "uuid";
import { permissionFactory } from "./permission.factory.js";
export async function userFactory(overrides = {}) {
  let customPassword = false;
  let password;
  if (overrides && overrides.password) {
    password = bcryptUtil.hashPassword(overrides.password);
    customPassword = overrides.password;
  } else {
    password = bcryptUtil.hashPassword("123456@AbcsQQ");
  }
  try {
    const defaults = {
      first_name: "John",
      last_name: "Doe",
      email: overrides.email || `user+${uuidv4()}@test.com`,
      is_verified: false,
      UserRole: {
        role: "client",
        related_type: "client",
        related_id: null,
      },
    };
    const user = await db.User.create(
      { ...defaults, ...overrides, password },
      { include: { model: db.UserRole } }
    );
    return {
      ...user.toJSON(),
      plainPassword: customPassword ? customPassword : "123456@AbcsQQ",
    };
  } catch (error) {
    errorLogger(error);
  }
}

export async function userWithTokenFactory(overrides) {
  const user = await userFactory(overrides);
  const { accessToken, refreshToken } = jwtMiddleware.generateTokens(user);
  return { user, accessToken };
}

export async function userAdminFactory(overrides = {}) {
  try {
    const { user, accessToken } = await userWithTokenFactory({
      is_verified: true,
      UserRole: {
        role: "admin",
        related_type: "admin",
        related_id: null,
      },
      ...overrides,
    });
    const Permission = await permissionFactory("admin", user.id);
    return {
      accessToken,
      user,
    };
  } catch (error) {
    errorLogger(error);
  }
}
