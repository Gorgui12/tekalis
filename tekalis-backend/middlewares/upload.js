// ===============================================
// 14. middleware/upload.js (Multer)
// ===============================================
const multer = require("multer");
const path = require("path");
const { AppError } = require("./errorHandler");

// Configuration du stockage en mémoire
const storage = multer.memoryStorage();

// Filtre pour les types de fichiers
const fileFilter = (req, file, cb) => {
  // Types d'images acceptés
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new AppError("Seules les images sont autorisées (jpg, jpeg, png, gif, webp)", 400));
  }
};

// Configuration principale
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
  fileFilter: fileFilter
});

// Middleware pour une seule image
const uploadSingle = upload.single("image");

// Middleware pour plusieurs images
const uploadMultiple = upload.array("images", 5); // Max 5 images

// Middleware pour différents champs
const uploadFields = upload.fields([
  { name: "coverImage", maxCount: 1 },
  { name: "gallery", maxCount: 8 }
]);

// Gestion des erreurs Multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "Fichier trop volumineux. Maximum 5MB"
      });
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        success: false,
        message: "Trop de fichiers. Maximum 5 images"
      });
    }
    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        success: false,
        message: "Champ de fichier inattendu"
      });
    }
  }
  next(err);
};

module.exports = {
  uploadSingle,
  uploadMultiple,
  uploadFields,
  handleMulterError
};