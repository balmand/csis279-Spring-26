const EmailService = require("../services/EmailService");

class EmailController {
  static async send(req, res) {
    try {
      console.log("BODY:", req.body);

      const { to, subject, text } = req.body;

      if (!to || !subject || !text) {
        return res.status(400).json({
          success: false,
          message: "to, subject, and text are required",
        });
      }

      const result = await EmailService.send({ to, subject, text });

      return res.status(200).json(result);
    } catch (error) {
      console.error("Email send error:", error);
      return res.status(500).json({
        success: false,
        message: "Email failed to send",
        error: error.message,
      });
    }
  }
}

module.exports = EmailController;