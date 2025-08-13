const express = require( "express");
const User = require( "../models/User.js");
const bcrypt = require( "bcrypt");
const jwt = require( "jsonwebtoken");

const router = express.Router();

// 🔐 Inscription (Register)
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.post("/admin/register", async (req, res) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) return res.status(400).json({ message: "Email déjà utilisé" });

  const hashedPassword = await bcrypt.hash(password, 10);

  const newAdmin = new User({
    name,
    email,
    password: hashedPassword,
    isAdmin: true,  // ✅ admin
  });

  await newAdmin.save();
  res.status(201).json({ message: "Admin créé avec succès" });
});


// 🔑 Connexion (Login)
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id, isAdmin: user.isAdmin }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.status(200).json({ token, user: { id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
