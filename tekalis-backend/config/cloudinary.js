// ===============================================
// config/cloudinary.js
// ✅ FIX : guard si CLOUDINARY_* non configurées
//    pas de connexion automatique au require()
//    qui polluait les logs au démarrage
// ===============================================
const { Readable } = require("stream");

// Vérifier si Cloudinary est configuré
const isCloudinaryConfigured = () =>
  !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );

// Instance Cloudinary (lazy init)
let _cloudinary = null;

const getCloudinary = () => {
  if (_cloudinary) return _cloudinary;

  if (!isCloudinaryConfigured()) {
    throw new Error(
      "Cloudinary non configuré. Définissez CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY et CLOUDINARY_API_SECRET dans .env"
    );
  }

  const cloudinary = require("cloudinary").v2;
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });

  _cloudinary = cloudinary;
  return _cloudinary;
};

// Log au démarrage sans bloquer ni crasher
if (isCloudinaryConfigured()) {
  console.log("✅ Cloudinary configuré");
} else {
  console.warn("⚠️  Cloudinary non configuré — upload d'images désactivé");
}

// Upload une image depuis un buffer
const uploadFromBuffer = (buffer, folder = "products") => {
  return new Promise((resolve, reject) => {
    const cloudinary = getCloudinary();
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
    const cloudinary = getCloudinary();
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
    const cloudinary = getCloudinary();
    const result = await cloudinary.api.delete_resources(publicIds);
    return result;
  } catch (error) {
    console.error("Erreur suppression images:", error);
    throw error;
  }
};

module.exports = {
  isCloudinaryConfigured,
  uploadFromBuffer,
  uploadMultiple,
  deleteImage,
  deleteMultiple
};