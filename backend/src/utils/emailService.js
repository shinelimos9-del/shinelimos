const nodemailer = require("nodemailer");

// Phase 2.1 — env-driven sender. All booking emails (booking
// confirmations in booking.js/payment.js and driver assignment emails in
// driverPortal.js) go through this one sendEmail, so one sender change
// covers all of them.
//
// Default (no EMAIL_HOST): the previous Gmail service path, unchanged.
// To send from booking@shinelimos.com instead, set in the production
// backend environment (Hostinger, by Amjad — never in code):
//   EMAIL_HOST=smtp.hostinger.com
//   EMAIL_PORT=465
//   EMAIL_USER=booking@shinelimos.com
//   EMAIL_PASS=<the booking mailbox password, set in hPanel>
// After changing env vars the backend must pick them up (redeploy /
// restart, per Hostinger's behaviour). Note the admin OTP Brevo path also
// uses EMAIL_USER as its sender, so OTPs will also come from booking@
// after the switch, with this Nodemailer sender as fallback if Brevo
// rejects the sender. No address or password is hardcoded here.
const transporter = process.env.EMAIL_HOST
  ? nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT || 465),
      secure: process.env.EMAIL_SECURE !== "false",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })
  : nodemailer.createTransport({
      service: "gmail",
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
