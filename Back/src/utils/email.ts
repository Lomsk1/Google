import nodemailer from "nodemailer";
import dotenv from "dotenv";
import path from "path";
import { htmlToText } from "html-to-text";
import pug from "pug";
dotenv.config();

class Email {
  to: string;
  firstName: string;
  url: string;
  from: string;

  constructor(user: { email: string; firstName: string }, url: string) {
    this.to = user.email;
    this.firstName = user.firstName;
    this.url = url;
    this.from = `AI <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      // secure: false,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    } as any);
  }

  // Send the actual Email
  async send(template: string, subject: string) {
    // 1) Render HTML based on a pug template
    const html = pug.renderFile(path.join(`src/views/emails/${template}.pug`), {
      firstName: this.firstName,
      url: this.url,
      subject,
    });

    // 2) Define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText(html),
    };

    // 3) Create a transport and send email
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send("welcome", "Welcome to the AI Society");
  }
  async sendEmailActivation() {
    await this.send("emailConfirmation", "Activate your Email");
  }
  async sendPasswordReset() {
    await this.send(
      "passwordReset",
      "your password reset token (valid for only 10 minutes)"
    );
  }
}

export default Email;
