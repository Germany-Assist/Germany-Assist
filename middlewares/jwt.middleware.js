import { expressjwt } from "express-jwt";
import {
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
  ACCESS_TOKEN_EXPIRE_DURATION,
  REFRESH_TOKEN_EXPIRE_DURATION,
} from "../configs/serverConfig.js";
import jwt from "jsonwebtoken";
import { AppError } from "../utils/error.class.js";

export const authenticateJwt = expressjwt({
  secret: ACCESS_TOKEN_SECRET,
  algorithms: ["HS256"],
  getToken: (req) => {
    if (
      req.headers.authorization &&
      req.headers.authorization.split(" ")[0] === "Bearer"
    ) {
      return req.headers.authorization.split(" ")[1];
    }
    return null;
  },
});

export function verifyToken(token) {
  try {
    const decode = jwt.verify(token, REFRESH_TOKEN_SECRET);
    return decode;
  } catch (error) {
    throw new AppError(401, "invalid token", true, "invalid token");
  }
}
export function verifyAccessToken(token) {
  try {
    const decode = jwt.verify(token, ACCESS_TOKEN_SECRET);
    return decode;
  } catch (error) {
    throw new AppError(401, error.message, true, "invalid token");
  }
}

export function generateAccessToken(user) {
  const { id, role, is_root, BusinessId } = user;
  return jwt.sign({ id, role, is_root, BusinessId }, ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRE_DURATION,
  });
}

export function generateRefreshToken(user) {
  return jwt.sign({ userId: user.id }, REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRE_DURATION,
  });
}
export function generateTokens(user) {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  return { accessToken, refreshToken };
}
