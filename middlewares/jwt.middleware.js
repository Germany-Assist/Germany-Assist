import { expressjwt } from "express-jwt";
import {
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
  ACCESS_TOKEN_EXPIRE_DURATION,
  REFRESH_TOKEN_EXPIRE_DURATION,
} from "../configs/serverConfig.js";
import jwt from "jsonwebtoken";
import { AppError } from "../utils/error.class.js";
const authenticateJwt = expressjwt({
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

function verifyToken(token) {
  try {
    const decode = jwt.verify(token, REFRESH_TOKEN_SECRET);
    return decode;
  } catch (error) {
    throw new AppError(401, "invalid token", true, "invalid token");
  }
}
function verifyAccessToken(token) {
  try {
    const decode = jwt.verify(token, ACCESS_TOKEN_SECRET);
    return decode;
  } catch (error) {
    throw new AppError(401, error.message, true, "invalid token");
  }
}

function generateAccessToken(user) {
  const { id } = user;
  const { role, related_type, related_id } = user.UserRole;
  return jwt.sign({ id, role, related_type, related_id }, ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRE_DURATION,
  });
}
function generateRefreshToken(user) {
  const { id } = user;
  const { role, related_type, related_id } = user.UserRole;
  return jwt.sign(
    { id, role, related_type, related_id },
    REFRESH_TOKEN_SECRET,
    {
      expiresIn: REFRESH_TOKEN_EXPIRE_DURATION,
    }
  );
}

function generateTokens(user) {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  return { accessToken, refreshToken };
}
const jwtUtils = {
  generateTokens,
  generateRefreshToken,
  generateAccessToken,
  verifyAccessToken,
  verifyToken,
  authenticateJwt,
};

export default jwtUtils;
