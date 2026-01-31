// ===============================================
// 15. config/cloudinary.js
// ===============================================
const cloudinary = require("cloudinary").v2;
const { Readable } = require("stream");

// Configuration Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Vérifier la connexion
const testConnection = async () => {
  try {
    await cloudinary.api.ping();
    console.log("✅ Cloudinary connecté");
  } catch (error) {
    console.error("❌ Erreur connexion Cloudinary:", error);
  }
};

testConnection();

// Upload une image depuis un buffer
const uploadFromBuffer = (buffer, folder = "products") => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `tekalis/${folder}`,
        resource_type: "auto",
        transformation: [
          { width: 1200, height: 1200, crop: "limit" },
          { quality: "auto:good" },
          { fetch_format: "auto" }
        ]
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve({
            url: result.secure_url,
            public_id: result.public_id
          });
        }
      }
    );
    
    const readableStream = Readable.from(buffer);
    readableStream.pipe(uploadStream);
  });
};

// Upload plusieurs images
const uploadMultiple = async (files, folder = "products") => {
  const uploadPromises = files.map(file => 
    uploadFromBuffer(file.buffer, folder)
  );
  return await Promise.all(uploadPromises);
};

// Supprimer une image
const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error("Erreur suppression image:", error);
    throw error;
  }
};

// Supprimer plusieurs images
const deleteMultiple = async (publicIds) => {
  try {
    const result = await cloudinary.api.delete_resources(publicIds);
    return result;
  } catch (error) {
    console.error("Erreur suppression images:", error);
    throw error;
  }
};

module.exports = {
  cloudinary,
  uploadFromBuffer,
  uploadMultiple,
  deleteImage,
  deleteMultiple
};
