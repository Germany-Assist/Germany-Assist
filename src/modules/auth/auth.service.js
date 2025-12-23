import emailService from "../../services/email/email.service.js";
import db from "../../database/index.js";
import verificationEmailTemplate from "../../services/email/templates/verificationEmailTemplate.js";
import crypto from "crypto";
import { errorLogger } from "../../utils/loggers.js";
import { APP_DOMAIN } from "../../configs/serverConfig.js";
const generateToken = () => crypto.randomBytes(32).toString("hex");
const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

export async function sendVerificationEmail(userEmail, userId) {
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

const authServices = { sendVerificationEmail };
export default authServices;
