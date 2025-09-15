import { loginUserTokenController } from "../../controllers/user.controller.js";
import db from "../../database/dbIndex.js";
import jwtMiddleware from "../../middlewares/jwt.middleware.js";
import { hashPassword } from "../../utils/bcrypt.util.js";

export async function userFactory(overrides = {}) {
  const defaults = {
    firstName: "John",
    lastName: "Doe",
    email: "user@test.com",
    password: hashPassword("123456"),
    role: "client",
    BusinessId: null,
    isVerified: false,
  };
  return await db.User.create({ ...defaults, ...overrides });
}
export async function userWithTokenFactory(userData) {
  const user = await userFactory(user);
  const { accessToken, refreshToken } = jwtMiddleware.generateTokens(user);
  return { user, accessToken };
}
