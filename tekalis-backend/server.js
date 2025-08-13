const express =  require("express") ;
const cors = require("cors") ;
const dotenv = require("dotenv") ;
const mongoose = require("mongoose") ;
const authRoutes = require("./routes/authRoutes.js") ;
const userRoutes = require("./routes/userRoutes.js") ;
const productRoutes = require("./routes/productRoutes.js") ;
const orderRoutes = require("./routes/orderRoutes.js") ;
const paymentRoutes = require("./routes/paymentRoutes.js") ;;
const statRoutes = require("./routes/stats.js") 




dotenv.config();
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());



app.use("/api/users", userRoutes);

app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payment", paymentRoutes);

app.use("/api/stats", statRoutes);

console.log("MONGO_URI:", process.env.MONGO_URI);
// Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Error:", err));

// Route test
app.get("/", (req, res) => {
  res.send("Tekalis API is running...");
});

// Port d'écoute
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
