import { getCachedData, setCachedData } from "../config/redis.js";

export const redisCache = (ttl = 60) => {
  return async (req, res, next) => {
    try {
      const key = `cache:${req.originalUrl}`;

      const cachedData = await getCachedData(key);
      if (cachedData) {
        return res.json(cachedData);
      }

      // Monkey-patch res.json to store response in cache
      const originalJson = res.json.bind(res);
      res.json = (body) => {
        setCachedData(key, body, ttl);
        return originalJson(body);
      };

      next();
    } catch (err) {
      console.error("Redis cache middleware error:", err);
      next();
    }
  };
};
