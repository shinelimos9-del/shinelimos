const admin_model = require("../models/adminModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const { sendEmail } = require("../utils/emailService");

const sendOTP = async (email, otp) => {
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #ffffff;">
        <h2 style="color: #111; text-align: center; font-family: Georgia, serif;">Shine Limos Admin</h2>
        <h3 style="color: #444; text-align: center; margin-top: 0;">Password Reset Verification Code</h3>
        <p>Dear Admin,</p>
        <p>You requested a password reset for your Shine Limos Admin account. Your 6-digit verification code is:</p>
        <div style="background-color: #000000; padding: 18px; text-align: center; border-radius: 8px; font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #d4af37; margin: 20px 0;">
          ${otp}
        </div>
        <p style="font-size: 13px; color: #666;">This verification code is valid for 10 minutes. If you did not request a password reset, please ignore this email.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 11px; color: #999; text-align: center;">&copy; ${new Date().getFullYear()} Shine Limos LLC. All rights reserved.</p>
      </div>
    `;

    if (process.env.BREVO_API_KEY) {
        try {
            const response = await axios.post(
                "https://api.brevo.com/v3/smtp/email",
                {
                    sender: { email: process.env.EMAIL_USER || "vikasjangid3352@gmail.com", name: "Shine Limos" },
                    to: [{ email: email }],
                    subject: "Shine Limos - Admin Password Reset Code",
                    htmlContent: htmlContent,
                },
                {
                    headers: {
                        "api-key": process.env.BREVO_API_KEY,
                        "Content-Type": "application/json",
                    },
                }
            );
            if (response.data) {
                console.log("OTP sent via Brevo API successfully");
                return { success: true, data: response.data };
            }
        } catch (brevoErr) {
            console.error("Brevo API sendOTP failed, falling back to Nodemailer:", brevoErr?.response?.data || brevoErr.message);
        }
    }

    // Fallback to Nodemailer
    return await sendEmail({
        to: email,
        subject: "Shine Limos - Admin Password Reset Code",
        html: htmlContent,
    });
};

exports.sendOtpTOadmin = async (req, res) => {
    const { email } = req.body;

    try {
        if (!email || typeof email !== "string" || !email.trim()) {
            return {
                message: "Please provide a valid email address.",
                success: false,
            };
        }

        const cleanEmail = email.trim().toLowerCase();
        const adminData = await admin_model.findOne({
            email: { $regex: new RegExp(`^${cleanEmail.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}$`, "i") }
        });

        if (!adminData) {
            return {
                message: "No admin account found with this email address.",
                success: false,
            };
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        adminData.otp = otp;
        adminData.otpExpiry = otpExpiry;
        await adminData.save();

        const otp_send = await sendOTP(cleanEmail, otp);
        if (!otp_send || otp_send.success === false) {
            return {
                message: "Failed to deliver OTP email. Please try again.",
                success: false,
            };
        }

        return {
            message: "OTP sent successfully to your email.",
            success: true,
        };
    } catch (error) {
        console.error("sendOtpTOadmin error:", error);
        return {
            message: error.message || "Internal server error while sending OTP.",
            success: false,
        };
    }
};

exports.verifyOtp = async (req, res) => {
    const { email, otp } = req.body;

    try {
        if (!email || !otp) {
            return {
                message: "Email and OTP code are required.",
                success: false,
            };
        }

        const cleanEmail = String(email).trim().toLowerCase();
        const user = await admin_model.findOne({
            email: { $regex: new RegExp(`^${cleanEmail.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}$`, "i") }
        });

        if (!user) {
            return {
                message: "Invalid email address.",
                success: false,
            };
        }

        const storedOtp = user.otp ? String(user.otp).trim() : null;
        const inputOtp = String(otp).trim();

        if (!storedOtp || storedOtp !== inputOtp) {
            return {
                message: "Invalid OTP code. Please check and try again.",
                success: false,
            };
        }

        if (user.otpExpiry && new Date(user.otpExpiry).getTime() < Date.now()) {
            return {
                message: "OTP code has expired. Please request a new code.",
                success: false,
            };
        }

        const token = jwt.sign(
            { id: user._id },
            process.env.SECRET_KEY || "itisthesecretkeyforhealthandfitnesstrackerapp",
            { expiresIn: "1h" }
        );

        user.auth_key = token;
        await user.save();

        if (res && typeof res.cookie === "function") {
            res.cookie("token", token);
        }

        return {
            token,
            message: "OTP verified successfully.",
            success: true,
        };
    } catch (error) {
        console.error("verifyOtp error:", error);
        return {
            message: error.message || "Failed to verify OTP.",
            success: false,
        };
    }
};

exports.admin_forgatePassword = async (req, res) => {
    const newPassword = req.body.newPassword || req.body.password;
    const email = req.body.email || req.query.email;

    try {
        if (!newPassword || !email) {
            return {
                message: "Email and new password are required.",
                success: false,
            };
        }

        if (String(newPassword).length < 6) {
            return {
                message: "Password must be at least 6 characters long.",
                success: false,
            };
        }

        const cleanEmail = String(email).trim().toLowerCase();
        const existingAdmin = await admin_model.findOne({
            email: { $regex: new RegExp(`^${cleanEmail.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}$`, "i") }
        });

        if (!existingAdmin) {
            return {
                success: false,
                message: "Admin account not found.",
            };
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        existingAdmin.password = hashedPassword;
        existingAdmin.otp = null;
        existingAdmin.otpExpiry = null;
        await existingAdmin.save();

        return {
            success: true,
            message: "Password updated successfully. Please log in with your new password.",
        };
    } catch (error) {
        console.error("admin_forgatePassword error:", error);
        return {
            success: false,
            message: error.message || "Internal server error.",
        };
    }
};

exports.admin_login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return {
                success: false,
                message: "Email and password are required.",
            };
        }

        const cleanEmail = String(email).trim().toLowerCase();
        const existingAdmin = await admin_model.findOne({
            email: { $regex: new RegExp(`^${cleanEmail.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}$`, "i") }
        });

        if (!existingAdmin) {
            return {
                success: false,
                message: "Invalid email or not registered!",
            };
        }

        const isPasswordValid = await bcrypt.compare(
            password,
            existingAdmin.password
        );

        if (!isPasswordValid) {
            return {
                success: false,
                message: "Invalid email or password",
            };
        }

        const token = jwt.sign(
            { id: existingAdmin._id },
            process.env.SECRET_KEY || "itisthesecretkeyforhealthandfitnesstrackerapp",
            { expiresIn: "7d" }
        );

        if (res && typeof res.cookie === "function") {
            res.cookie("token", token);
        }

        existingAdmin.auth_key = token;
        await existingAdmin.save();

        return {
            message: "User logged in successfully",
            success: true,
            token: token,
            userId: existingAdmin._id
        };
    } catch (error) {
        console.error("admin_login error:", error);
        return {
            message: error.message || "Internal server error",
            success: false,
        };
    }
};

exports.admin_logout = async (req, res) => {
    try {
        if (!req.user) {
            return {
                success: false,
                message: "Unauthorized",
            };
        }

        try {
            await admin_model.findByIdAndUpdate(req.user._id, { $unset: { auth_key: "" } });
        } catch (dbErr) {
            console.error('Failed to remove auth_key on logout:', dbErr);
        }

        if (res && typeof res.clearCookie === "function") {
            res.clearCookie("token");
        }

        return {
            success: true,
            message: "Logged out successfully",
        };
    } catch (error) {
        console.error("admin_logout error:", error);
        return {
            success: false,
            message: error.message || "Internal server error",
        };
    }
};
