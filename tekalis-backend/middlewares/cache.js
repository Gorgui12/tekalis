// ===============================================
// 18. MIDDLEWARE - middleware/cache.js (Redis)
// ===============================================
const redis = require("redis");
const client = redis.createClient({
  host: process.env.REDIS_HOST || "localhost",
  port: process.env.REDIS_PORT || 6379
});

client.on("error", (err) => {
  console.error("❌ Redis Error:", err);
});

// Middleware de cache
const cacheMiddleware = (duration = 300) => {
  return async (req, res, next) => {
    if (req.method !== "GET") {
      return next();
    }
    
    const key = `cache:${req.originalUrl}`;
    
    try {
      const cachedData = await client.get(key);
      
      if (cachedData) {
        console.log("✅ Cache HIT:", key);
        return res.status(200).json(JSON.parse(cachedData));
      }
      
      console.log("❌ Cache MISS:", key);
      
      // Stocker la réponse originale
      const originalSend = res.json;
      res.json = function(data) {
        client.setex(key, duration, JSON.stringify(data));
        originalSend.call(this, data);
      };
      
      next();
    } catch (error) {
      console.error("Cache error:", error);
      next();
    }
  };
};

module.exports = { client, cacheMiddleware };