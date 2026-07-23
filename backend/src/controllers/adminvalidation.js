const {admin_login,verifyOtp,sendOtpTOadmin,admin_forgatePassword,admin_logout } = require("../services/adminvalidation")

exports.sendOtpTOadmin = async (req, res) => {
    try {
      const data = await sendOtpTOadmin(req, res);
      if (data && data.success) {
        return res.status(200).json(data);
      } else {
        return res.status(400).json(data || { success: false, message: "Failed to send OTP" });
      }
    } catch (error) {
      console.log("Error in sendOtpTOadmin:", error);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

exports.verifyOtp = async (req, res) => {
    try {
      const data = await verifyOtp(req, res);
      if (data && data.success) {
        return res.status(200).json(data);
      } else {
        return res.status(400).json(data || { success: false, message: "Verification failed" });
      }
    } catch (error) {
      console.log("Error in verifyOtp:", error);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

exports.admin_login = async (req, res) => {
    try {
      const data = await admin_login(req, res);
      if (data && data.success) {
        return res.status(200).json(data);
      } else {
        return res.status(400).json(data || { success: false, message: "Login failed" });
      }
    } catch (error) {
      console.log("Error in admin_login:", error);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

exports.admin_forgatePassword = async (req, res) => {
    try {
      const data = await admin_forgatePassword(req, res);
      if (data && data.success) {
        return res.status(200).json(data);
      } else {
        return res.status(400).json(data || { success: false, message: "Password reset failed" });
      }
    } catch (error) {
      console.log("Error in admin_forgatePassword:", error);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

exports.admin_logout = async (req, res) => {
    try {
      const data = await admin_logout(req, res);
      if (data && data.success) {
        return res.status(200).json(data);
      } else {
        return res.status(400).json(data || { success: false, message: "Logout failed" });
      }
    } catch (error) {
      console.log("Error in admin_logout:", error);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

exports.get_adminProfile = async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ success: false, message: "Unauthorized" });
        return res.status(200).json({ success: true, admin: req.user });
    } catch (error) {
        console.log("get_adminProfile error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

exports.get_notifications = async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ success: false, message: "Unauthorized" });
        return res.status(200).json({ success: true, notifications: req.user.notifications || [] });
    } catch (error) {
        console.log("get_notifications error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

exports.mark_notifications_read = async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ success: false, message: "Unauthorized" });
        const admin_model = require("../models/adminModel");
        await admin_model.updateOne(
            { _id: req.user._id },
            { $set: { "notifications.$[].is_read": true } }
        );
        return res.status(200).json({ success: true, message: "Notifications marked as read" });
    } catch (error) {
        console.log("mark_notifications_read error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};
