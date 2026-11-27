const express = require("express");
const multer = require("multer");
const path = require("path");
const quoteController = require("../controllers/quoteController");
const { verifyToken, isAdmin, optionalAuth } = require("../middlewares/authMiddleware");
const { quoteValidation } = require("../middlewares/validation");

const allowedMimeTypes = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv",
  "text/plain"
];
const allowedExtensions = [
  ".pdf",
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".csv",
  ".txt"
];

const sanitizeFilename = (name) => {
  const cleaned = path.basename(String(name || "attachment"))
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^\.+/, "")
    .slice(0, 120);
  return cleaned || "attachment";
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    files: 5,
    fileSize: 2 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    const extension = path.extname(file.originalname || "").toLowerCase();
    const mimeType = String(file.mimetype || "").toLowerCase();
    if (!allowedMimeTypes.includes(mimeType) || !allowedExtensions.includes(extension)) {
      const error = new Error(`Type de fichier non autorisé: ${sanitizeFilename(file.originalname)}`);
      error.code = "INVALID_FILE_TYPE";
      return cb(error);
    }
    cb(null, true);
  }
});

const uploadAttachments = upload.array("attachments", 5);

const handleUpload = (req, res, next) => {
  uploadAttachments(req, res, (error) => {
    if (!error) return next();
    const messages = {
      LIMIT_FILE_SIZE: "Chaque pièce jointe ne doit pas dépasser 2 Mo",
      LIMIT_FILE_COUNT: "5 pièces jointes maximum",
      LIMIT_UNEXPECTED_FILE: "Champ de fichier inattendu"
    };
    const message = error instanceof multer.MulterError
      ? messages[error.code] || "Erreur lors du téléversement des pièces jointes"
      : error.message;
    return res.status(400).json({
      success: false,
      message,
      errors: [{ field: "attachments", message }]
    });
  });
};

const router = express.Router();

router.post("/", handleUpload, optionalAuth, quoteValidation.create, quoteController.createQuote);

router.get("/admin", verifyToken, isAdmin, quoteController.getAdminQuotes);
router.get("/admin/:id", verifyToken, isAdmin, quoteController.getAdminQuote);
router.put("/admin/:id/status", verifyToken, isAdmin, quoteValidation.status, quoteController.updateQuoteStatus);
router.get("/admin/:id/pdf", verifyToken, isAdmin, quoteController.downloadQuotePdf);
router.get("/admin/:id/attachments/:index", verifyToken, isAdmin, quoteController.downloadAttachment);

module.exports = router;
