const admin_model = require("../models/adminModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "Gmail",
     auth: {
        user: "rizeworldcode@gmail.com",
        pass: "tzyj jabr qyid ynxb",
    },
});

const sendOTP = (email, otp) => {
    const mailOptions = {
        from: "vikasjangid3352@gmail.com",
        to: email,
        subject: "Your OTP Code",
        text: `Dear User,
Your verification code is:
${otp}
This code is valid for 10 minutes.
If you did not request a password reset, please ignore this email.
Thank you,
RizeWorld Team`,
    };

    return transporter.sendMail(mailOptions);
};



exports.verifyOtp = async (req, res) => {
    const { email, otp } = req.body;
    console.log(typeof otp);
    try {
        const user = await admin_model.findOne({ email });
        if (!user) {
            return {
                message: "Invalid email",
                success: false,
            };
        }
        console.log(typeof user.otp);
        if (user.otp !== otp || otp == undefined || user.otpExpiry < Date.now()) {
            return {
                message: "Invalid or expired OTP",
                success: false,
            };
        }

        const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY);
        if (!token) {
            return {
                message: "Token generation failed",
                success: false,
            };
        }
        res.cookie("token", token);
        // const hashedPassword = await bcrypt.hash(newPassword, 10);
        const update_admin = await admin_model.findOneAndUpdate({ email: email },
            {
                $set: {
                    auth_key: token,
                }
            },
            { new: true }
        )

        if (!update_admin) {
            return {
                message: "password updation failed",
                success: false,
            };
        }
        return {
            token,
            message: "Password update successfully",
            success: true,
        };
    } catch (error) {
        console.log(error);
        return {
            message: error,
            success: false,
        };
    }
};

exports.admin_login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const existingAdmin = await admin_model.findOne({ email });
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

        const token = jwt.sign({ id: existingAdmin._id }, process.env.SECRET_KEY);
        if (!token) {
            return {
                success: false,
                message: " Token generation failed"
            };
        }
        // Set the token to cookies
        res.cookie("token", token);
        const authKeyInsertion = await admin_model.findOneAndUpdate(
            { _id: existingAdmin._id },
            { auth_key: token },
            { new: true }
        );

        if (!authKeyInsertion) {
            return {
                success: false,
                message: "Token updation failed"
            };
        }

        return {
            message: "User logged in successfully",
            success: true,
            token: token,
            userId: existingAdmin._id
        };
    } catch (error) {
        console.log(error);
        return {
            message: error.message || "Internal server error",
            success: false,
        };
    }
};


exports.sendOtpTOadmin = async (req, res) => {
    const { email } = req.body;

    try {
        const AdminData = await admin_model.findOne({ email: email });

        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        const otpExpiry = Date.now() + 3600000; // 1 hour
        if (AdminData) {
            const update_admin = await admin_model.findOneAndUpdate({ email: email },
                {
                    $set: {
                        otp: otp
                    }
                },
                { new: true }
            )
            if (!update_admin) {
                return {
                    message: "admin not found",
                    success: false,
                };
            }
            const otp_send = await sendOTP(email, otp);
            if (!otp_send) {
                return {
                    message: "otp send faild",
                    success: false,
                };
            }
            return {
                message: "OTP send successfully",
                success: true,
            };
        }


    } catch (error) {
        console.log(error);
        return {
            message: error,
            success: false,
        };
    }
};

exports.admin_forgatePassword = async (req, res) => {
    const { newPassword } = req.body;
    const email = req.query.email;
    console.log(newPassword, email);
    

    try {
        if (!newPassword && !email) {
            return {
                message: "email or password not define",
                success: false
            }
        }
        const existingAdmin = await admin_model.findOne({ email });
        if (!existingAdmin) {
            return {
                success: false,
                message: "Admin not found",
            };
        }
        if (existingAdmin.auth_key) {
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            existingAdmin.password = hashedPassword;
            await existingAdmin.save();

            return {
                success: true,
                message: "Password updated successfully",
            };
        }
        return {
            success: false,
            message: "try again",
        };

    } catch (error) {
        console.log(error);
        return {
            success: false,
            message: "Internal server error",
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
        // Remove auth_key from the admin record so the token can't be reused
        try {
            // prefer unsetting the field, but setting to null is also acceptable
            await admin_model.findByIdAndUpdate(req.user._id, { $unset: { auth_key: "" } });
        } catch (dbErr) {
            console.log('Failed to remove auth_key on logout:', dbErr);
            // don't block logout response if DB update fails
        }

        // Invalidate the token (token blacklist can be implemented here if needed)
        res.clearCookie("token");
        return {
            success: true,
            message: "Logged out successfully",
        };
    } catch (error) {
        console.log(error);
        return {
            success: false,
            message: "Internal server error",
        };
    }
};
