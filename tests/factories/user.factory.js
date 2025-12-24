import db from "../../src/database/index.js";
import jwtMiddleware from "../../src/middlewares/jwt.middleware.js";
import bcryptUtil from "../../src/utils/bcrypt.util.js";
import { errorLogger } from "../../src/utils/loggers.js";
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
      firstName: "John",
      lastName: "Doe",
      email: overrides.email || `user+${uuidv4()}@test.com`,
      isVerified: true,
      UserRole: {
        role: "client",
        relatedType: "client",
        relatedId: null,
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
      isVerified: true,
      UserRole: {
        role: "admin",
        relatedType: "admin",
        relatedId: null,
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
