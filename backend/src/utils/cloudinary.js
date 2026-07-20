const cloudinary = require("cloudinary").v2;
const fs = require("fs");

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
 * Uploads a local file to Cloudinary and deletes the local temporary copy.
 * Returns the secure URL of the uploaded image on success, or null if Cloudinary is not configured.
 * @param {string} filePath - Path to the local temporary file
 * @returns {Promise<string|null>}
 */
exports.uploadToCloudinary = async (filePath) => {
  if (!isCloudinaryConfigured) {
    return null;
  }
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: "shinelimos",
      resource_type: "auto",
    });
    
    // Clean up local temp file synchronously
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (unlinkErr) {
      console.error("Cloudinary: Failed to delete local temp file:", unlinkErr);
    }
    
    return result.secure_url;
  } catch (error) {
    console.error("Cloudinary: Upload error:", error);
    // Attempt cleanup even on failure
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (cleanupErr) {
      console.error("Cloudinary: Failed to delete local temp file during error cleanup:", cleanupErr);
    }
    throw error;
  }
};
