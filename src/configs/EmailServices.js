import nodemailer from "nodemailer";
import { errorLogger, infoLogger } from "../utils/loggers.js";
import crypto from "crypto";
import db from "../database/index.js";

const EMAIL_HOST = process.env.EMAIL_HOST;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const EMAIL_SMTP_PORT = process.env.EMAIL_SMTP_PORT;
const APP_DOMAIN = process.env.APP_DOMAIN;

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: EMAIL_HOST,
      port: EMAIL_SMTP_PORT,
      secure: false,
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
    });
  }

  async sendEmail({ to, subject, html, text }) {
    try {
      await this.transporter.sendMail({
        from: `"Germany Assist" <${EMAIL_USER}>`,
        to,
        subject,
        html,
        text,
      });
      infoLogger(`📧 Email sent to ${to} for ${subject}`);
    } catch (err) {
      errorLogger(
        `❌ Failed to send email for ${subject} to ${to}:`,
        err.message
      );
      throw err;
    }
  }

  async sendNotificationEmail(user, message, url = "") {
    const html = `<p>${message}</p>${url ? `<a href="${url}">View</a>` : ""}`;
    await this.sendEmail({ to: user.email, subject: "Notification", html });
  }

  async sendVerificationEmail(userEmail, userId) {
    //generate token
    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    //save the token in the database
    const now = new Date();
    const databaseToken = {
      token: tokenHash,
      userId: userId,
      oneTime: true,
      isValid: true,
      type: "emailVerification",
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    };
    try {
      await db.Token.create(databaseToken);
      const link = `${APP_DOMAIN}/api/auth/verifyAccount?token=${token}`;
      const html = generateVerificationEmail(link);
      await this.sendEmail({
        to: userEmail,
        subject: "Verification Email",
        html,
      });
    } catch (error) {
      errorLogger(error);
    }
  }

  async sendNotificationPaymentEmail(userEmail, providerEmail, message) {
    const html = buildEmailTemplateForNotifications({
      title: "Payment Confirmation",
      message: message,
      footerText: "Germany-Assist",
    });
    await Promise.all([
      this.sendEmail({ to: userEmail, subject: "Payment success", html }),
      this.sendEmail({ to: providerEmail, subject: "Payment success", html }),
    ]);
  }
}

const generateVerificationEmail = (verificationLink) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Verify Your Email</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 50px auto;
      background-color: #ffffff;
      padding: 30px;
      border-radius: 10px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    h1 {
      color: #2f2c57;
    }
    p {
      font-size: 16px;
      line-height: 1.5;
      color: #333333;
    }
    .button {
      display: inline-block;
      margin-top: 20px;
      padding: 12px 25px;
      font-size: 16px;
      color: #ffffff;
      background-color: #2f2c57;
      text-decoration: none;
      border-radius: 5px;
    }
    .footer {
      margin-top: 30px;
      font-size: 12px;
      color: #999999;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Verify Your Email</h1>
    <p>Thanks for registering! Please click the button below to verify your email address:</p>
    <a href="${verificationLink}" class="button">Verify Email</a>
    <p>If the button doesn’t work, copy and paste this link into your browser:</p>
    <p><a href="${verificationLink}">${verificationLink}</a></p>
    <div class="footer">
      <p>If you didn’t create an account, you can safely ignore this email.</p>
    </div>
  </div>
</body>
</html>
`;

function buildEmailTemplateForNotifications({
  title = "Notification",
  message = "",
  footerText = "Germany Assist.",
}) {
  return `
  <div style="font-family: Arial, sans-serif; padding: 20px; background:#f5f5f5;">
    <div style="max-width: 600px; margin:auto; background:#ffffff; padding:20px; border-radius:6px;">

      <h2 style="margin-top:0; color:#333; text-align:center;">${title}</h2>

      <p style="font-size:14px; color:#555; line-height:1.5;">
        ${message}
      </p>

      <p style="font-size:12px; color:#888; text-align:center; margin-top:30px;">
        ${footerText}
      </p>

    </div>
  </div>
  `;
}
export default new EmailService();
