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

const generateToken = () => crypto.randomBytes(32).toString("hex");
const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

export async function sendVerificationEmail(userEmail, userId) {
  try {
    console.log("im sopposed to send an email");
    return;
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
    await db.Token.create(databaseToken);
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
  const user = await userRepository.getUserById(auth);
  const sanitizedUser = await userMapper.sanitizeUser(user);
  return sanitizedUser;
}
const authServices = {
  sendVerificationEmail,
  loginUser,
  loginToken,
  refreshUserToken,
  verifyUserManual,
};
export default authServices;
