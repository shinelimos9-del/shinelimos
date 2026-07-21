require("dotenv").config();
const jwt = require("jsonwebtoken");
const user_model = require("../src/models/adminModel");

// Middleware for handling auth
async function user_auth(req, res, next) {
  try {
    const tokenHead = req.headers["authorization"];
    console.log(tokenHead);

    if (!tokenHead) {
      return res.status(401).json({ message: "Authorization header is missing", success: false });
    }

    const token = tokenHead.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "User is not logged in", success: false });
    }
    const jwtPassword = process.env.SECRET_KEY;
    const decode = jwt.verify(token, jwtPassword);
    let user = await user_model
      .findOne({ _id: decode.id })
      .select("-password -auth_key -notificationToken")
      .exec();
    if (!user) return res.status(403).json({ msg: "User not found" });
    req.user = user;
    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: error.message || "Internal server error",
      success: false,
    });
  }
}

module.exports = user_auth;