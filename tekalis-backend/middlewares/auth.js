const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

module.exports = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ message: "Accès refusé" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (!decoded.isAdmin) {
      return res.status(403).json({ message: "Non autorisé, admin requis" });
    }

    req.admin = decoded;
    next();
  } catch (error) {
    res.status(400).json({ message: "Token invalide" });
  }
};
