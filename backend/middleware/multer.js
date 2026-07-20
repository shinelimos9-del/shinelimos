const multer = require("multer");

// Use memory storage to stream files directly to Cloudinary without writing local temp files
const storage = multer.memoryStorage();

const multer_photo = multer({
  storage: storage,
});

module.exports = multer_photo;