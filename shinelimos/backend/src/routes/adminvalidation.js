const express = require("express");
const router = express.Router();
const user_auth = require("../../middleware/user_auth");

const {
admin_login,verifyOtp,sendOtpTOadmin,admin_forgatePassword,admin_logout, get_adminProfile, get_notifications, mark_notifications_read
} = require("../controllers/adminvalidation");

router.post("/sendOtpTOadmin", sendOtpTOadmin);
router.post("/verifyOtp", verifyOtp);
router.post("/admin_login", admin_login);
router.post("/admin_forgatePassword", admin_forgatePassword);
router.post("/admin_logout",user_auth, admin_logout);

// Admin Profile & Notifications
router.get("/admin/profile", user_auth, get_adminProfile);
router.get("/admin/notifications", user_auth, get_notifications);
router.patch("/admin/notifications/read", user_auth, mark_notifications_read);

module.exports = router;