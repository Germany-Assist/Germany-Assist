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

  async sendNotificationEmail(user, message, url = "") {
    const html = `<p>${message}</p>${url ? `<a href="${url}">View</a>` : ""}`;
    await this.sendEmail({ to: user.email, subject: "Notification", html });
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
