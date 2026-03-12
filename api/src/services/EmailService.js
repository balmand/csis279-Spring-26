const nodemailer = require("nodemailer");

class EmailService {
  static async send({ to, subject, text }) {
    const testAccount = await nodemailer.createTestAccount();

    const transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    const info = await transporter.sendMail({
      from: '"Client Manager" <test@test.com>',
      to,
      subject,
      text,
    });

    console.log("Preview email:", nodemailer.getTestMessageUrl(info));

    return {
      success: true,
      message: "Email sent successfully",
      preview: nodemailer.getTestMessageUrl(info),
    };
  }
}

module.exports = EmailService;