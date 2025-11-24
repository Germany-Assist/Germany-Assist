import nodemailer from "nodemailer";
import { EMAIL_HOST, EMAIL_USER, EMAIL_PASS } from "../configs/serverConfig.js";

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: EMAIL_HOST,
      port: 587,
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
        from: `"My App" <${EMAIL_USER}>`,
        to,
        subject,
        html,
        text,
      });
      console.log(`📧 Email sent to ${to}`);
    } catch (err) {
      console.error(`❌ Failed to send email to ${to}:`, err.message);
      throw err;
    }
  }

  // Optional helper for notification emails
  async sendNotificationEmail(user, message, url = "") {
    const html = `<p>${message}</p>${url ? `<a href="${url}">View</a>` : ""}`;
    await this.sendEmail({ to: user.email, subject: "Notification", html });
  }
}

export default new EmailService();
