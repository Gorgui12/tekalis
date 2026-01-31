// ===============================================
// 16. config/redis.js
// ===============================================
const redis = require("redis");

// Configuration du client Redis
const redisClient = redis.createClient({
  host: process.env.REDIS_HOST || "localhost",
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  retry_strategy: (options) => {
    if (options.error && options.error.code === "ECONNREFUSED") {
      console.error("❌ Redis - Connexion refusée");
      return new Error("Redis non disponible");
    }
    if (options.total_retry_time > 1000 * 60 * 60) {
      return new Error("Redis - Timeout de retry dépassé");
    }
    if (options.attempt > 10) {
      return undefined;
    }
    return Math.min(options.attempt * 100, 3000);
  }
});

// Événements Redis
redisClient.on("connect", () => {
  console.log("✅ Redis connecté");
});

redisClient.on("error", (err) => {
  console.error("❌ Erreur Redis:", err);
});

redisClient.on("ready", () => {
  console.log("✅ Redis prêt");
});

// Promisifier les méthodes Redis
const { promisify } = require("util");
const getAsync = promisify(redisClient.get).bind(redisClient);
const setAsync = promisify(redisClient.set).bind(redisClient);
const delAsync = promisify(redisClient.del).bind(redisClient);
const keysAsync = promisify(redisClient.keys).bind(redisClient);

// Helper pour set avec expiration
const setExAsync = async (key, seconds, value) => {
  return await setAsync(key, value, "EX", seconds);
};

// Helper pour invalider le cache par pattern
const invalidatePattern = async (pattern) => {
  try {
    const keys = await keysAsync(pattern);
    if (keys.length > 0) {
      await delAsync(...keys);
      console.log(`🗑️ Cache invalidé: ${keys.length} clés (${pattern})`);
    }
  } catch (error) {
    console.error("Erreur invalidation cache:", error);
  }
};

module.exports = {
  redisClient,
  getAsync,
  setAsync,
  setExAsync,
  delAsync,
  keysAsync,
  invalidatePattern
};

