const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const path = require("path");

const isCloudinaryConfigured = process.env.CLOUDINARY_CLOUD_NAME &&
                              process.env.CLOUDINARY_API_KEY &&
                              process.env.CLOUDINARY_API_SECRET;

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log("Cloudinary utility initialized successfully.");
} else {
  console.warn("Cloudinary environment variables are missing. File uploads will fallback to local storage.");
}

/**
 * Uploads a file buffer (from Multer memory storage) to Cloudinary.
 * Falls back to local disk storage if Cloudinary credentials are not configured.
 * @param {Object} file - The Multer file object
 * @returns {Promise<string>} - The file URL
 */
exports.uploadFile = async (file) => {
  if (!file) return null;

  // 1. If Cloudinary is configured, stream buffer directly to Cloudinary
  if (isCloudinaryConfigured) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "shinelimos",
          resource_type: "auto",
        },
        (error, result) => {
          if (error) {
            console.error("Cloudinary: Upload stream error:", error);
            reject(error);
          } else {
            resolve(result.secure_url);
          }
        }
      );
      uploadStream.end(file.buffer);
    });
  }

  // 2. Fallback: Write file buffer to local public/uploads directory
  try {
    const uploadPath = path.join(__dirname, "../public/uploads");
    
    // Ensure the folder exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    const uniqueName = Date.now() + path.extname(file.originalname);
    const localFilePath = path.join(uploadPath, uniqueName);
    
    fs.writeFileSync(localFilePath, file.buffer);
    return `/uploads/${uniqueName}`;
  } catch (err) {
    console.error("Cloudinary: Local write fallback failed:", err);
    throw err;
  }
};
