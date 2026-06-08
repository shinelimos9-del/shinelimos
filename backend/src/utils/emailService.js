const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail", // Or your preferred email service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.sendEmail = async ({ to, subject, html }) => {
  try {
    const mailOptions = {
      from: `"Shine Limos" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
    return { success: true, info };
  } catch (error) {
    console.error("Email send error:", error);
    return { success: false, error: error.message };
  }
};
