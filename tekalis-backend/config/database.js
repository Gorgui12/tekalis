// ===============================================
// config/database.js - Configuration MongoDB
// ===============================================
const mongoose = require("mongoose");

/**
 * Connexion à MongoDB
 * Supporte à la fois MongoDB local et MongoDB Atlas (cloud)
 */
const connectDB = async () => {
  try {
    // Options de connexion MongoDB
    const options = {
      serverSelectionTimeoutMS: 10000, // Timeout après 10 secondes
      socketTimeoutMS: 45000, // Timeout socket après 45 secondes
      connectTimeoutMS: 10000, // Timeout de connexion après 10 secondes
    };

    // Connexion à MongoDB
    const conn = await mongoose.connect(process.env.MONGODB_URI, options);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📂 Database: ${conn.connection.name}`);

    // Événements de connexion
    mongoose.connection.on("connected", () => {
      console.log("✅ Mongoose connected to DB");
    });

    mongoose.connection.on("error", (err) => {
      console.error("❌ Mongoose connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("⚠️ Mongoose disconnected from DB");
    });

    // Fermeture propre de la connexion lors de l'arrêt de l'application
    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      console.log("🔒 Mongoose connection closed due to app termination");
      process.exit(0);
    });

  } catch (error) {
    console.error("❌ MongoDB Connection Error:");
    console.error(`   Message: ${error.message}`);
    
    // Messages d'aide selon le type d'erreur
    if (error.message.includes("ECONNREFUSED")) {
      console.error("\n💡 Solutions possibles:");
      console.error("   1. Vérifiez que MongoDB est démarré (mongod)");
      console.error("   2. Vérifiez l'URL de connexion dans .env");
      console.error("   3. Si vous utilisez MongoDB local, lancez: mongod");
      console.error("   4. Ou utilisez MongoDB Atlas (gratuit): https://www.mongodb.com/cloud/atlas\n");
    }
    
    if (error.message.includes("authentication failed")) {
      console.error("\n💡 Problème d'authentification:");
      console.error("   Vérifiez votre nom d'utilisateur et mot de passe dans MONGODB_URI\n");
    }
    
    if (error.message.includes("Invalid connection string")) {
      console.error("\n💡 URL de connexion invalide:");
      console.error("   Format attendu: mongodb://localhost:27017/tekalis");
      console.error("   Ou Atlas: mongodb+srv://user:pass@cluster.mongodb.net/tekalis\n");
    }

    // En production, on arrête le serveur si MongoDB ne connecte pas
    if (process.env.NODE_ENV === "production") {
      console.error("🛑 Arrêt du serveur en raison d'une erreur de connexion MongoDB");
      process.exit(1);
    } else {
      // En développement, on continue mais on avertit
      console.error("⚠️ Le serveur continue mais certaines fonctionnalités seront indisponibles\n");
    }
  }
};

// Fonction pour vérifier l'état de la connexion
const checkConnection = () => {
  const state = mongoose.connection.readyState;
  const states = {
    0: "Déconnecté",
    1: "Connecté",
    2: "En connexion",
    3: "En déconnexion"
  };
  return {
    isConnected: state === 1,
    state: states[state],
    host: mongoose.connection.host || "N/A"
  };
};

// Fonction pour fermer la connexion manuellement
const closeConnection = async () => {
  try {
    await mongoose.connection.close();
    console.log("🔒 Connexion MongoDB fermée manuellement");
  } catch (error) {
    console.error("❌ Erreur lors de la fermeture de la connexion:", error);
  }
};

module.exports = connectDB;

// Exporter aussi les fonctions utilitaires (optionnel)
module.exports.checkConnection = checkConnection;
module.exports.closeConnection = closeConnection;