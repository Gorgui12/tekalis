const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Access Denied" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // ✅ Correction ici :
    req.user = {
      _id: decoded.id,           // ou decoded._id si tu l’as stocké comme ça dans le token
      isAdmin: decoded.isAdmin,
    };

    console.log("Utilisateur authentifié:", req.user);
    next();
  } catch (error) {
    res.status(400).json({ message: "Invalid Token" });
  }
};
module.exports = verifyToken;

