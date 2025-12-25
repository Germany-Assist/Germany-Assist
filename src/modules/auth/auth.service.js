import emailService from "../../services/email/email.service.js";
import db from "../../database/index.js";
import verificationEmailTemplate from "../../services/email/templates/verificationEmailTemplate.js";
import crypto from "crypto";
import { errorLogger } from "../../utils/loggers.js";
import { APP_DOMAIN } from "../../configs/serverConfig.js";
import userMapper from "../user/user.mapper.js";
import { AppError } from "../../utils/error.class.js";
import userRepository from "../user/user.repository.js";
import jwtUtils from "../../middlewares/jwt.middleware.js";
import authRepository from "./auth.repository.js";
import { sequelize } from "../../configs/database.js";
import bcryptUtil from "../../utils/bcrypt.util.js";
import hashIdUtil from "../../utils/hashId.util.js";

const generateToken = () => crypto.randomBytes(32).toString("hex");
const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

export async function sendVerificationEmail(userEmail, userId, t) {
  try {
    const token = generateToken();
    const tokenHash = hashToken(token);
    const databaseToken = {
      token: tokenHash,
      userId: userId,
      oneTime: true,
      isValid: true,
      type: "emailVerification",
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    };
    await authRepository.createToken(databaseToken, t);
    const link = `${APP_DOMAIN}/api/auth/verifyAccount?token=${encodeURIComponent(
      token
    )}`;
    const html = verificationEmailTemplate(link);
    await emailService.sendEmail({
      to: userEmail,
      subject: "Verification Email",
      html,
    });
  } catch (error) {
    errorLogger(error);
  }
}

export async function verifyAccount(token) {
  const t = await sequelize.transaction();
  try {
    const hashedToken = hashToken(token);
    const dbToken = await authRepository.activateUser(hashedToken, t);
    if (!dbToken)
      throw new AppError(
        404,
        "failed to fine token",
        false,
        "failed to fine token"
      );
    await userRepository.alterUserVerification(dbToken.userId, true, t);
    await t.commit();
    return true;
  } catch (error) {
    await t.rollback();
    throw error;
  }
}
export async function refreshUserToken(refreshToken) {
  const { id } = jwtUtils.verifyRefreshToken(refreshToken);
  const user = await userRepository.getUserById(id);
  const accessToken = jwtUtils.generateAccessToken(user);
  return { accessToken };
}

export const loginUser = async (body) => {
  const { email, password } = body;
  const user = await userRepository.loginUser(email);
  if (!user)
    throw new AppError(401, "User not found", true, "invalid credentials");
  const compare = bcryptUtil.hashCompare(password, user.password);
  if (!compare)
    throw new AppError(401, "wrong password", true, "invalid credentials");
  const { accessToken, refreshToken } = jwtUtils.generateTokens(user);
  const sanitizedUser = await userMapper.sanitizeUser(user);
  return {
    user: sanitizedUser,
    accessToken,
    refreshToken,
  };
};
export async function loginToken(auth) {
  const user = await userRepository.getUserById(auth.id);
  const sanitizedUser = await userMapper.sanitizeUser(user);
  return sanitizedUser;
}
export async function verifyUserManual(hashedId) {
  const userId = hashIdUtil.hashIdDecode(hashedId);
  await userRepository.alterUserVerification(userId, true);
}
export async function getUserProfile(id) {
  const user = await userRepository.getUserProfile(id);
  const sanitizedUser = await userMapper.sanitizeUser(user);
  return sanitizedUser;
}
const authServices = {
  sendVerificationEmail,
  verifyAccount,
  loginUser,
  loginToken,
  refreshUserToken,
  verifyUserManual,
  getUserProfile,
};
export default authServices;
