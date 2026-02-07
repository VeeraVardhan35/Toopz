<<<<<<< HEAD
import { createClient } from 'redis';

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        return new Error('Too many retries');
      }
      return retries * 100;
    }
  }
});

redisClient.on('error', (err) => {
  console.error("❌ Redis error:", err);
});

redisClient.on('connect', () => {
  console.log("✅ Redis connected");
});

(async () => {
  try {
    await redisClient.connect();
    console.log("✅ Redis client ready");
  } catch (error) {
    console.error("❌ Redis connection failed:", error);
  }
})();
=======
import { Redis } from "@upstash/redis";

const redisClient = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

/* =========================
   CACHE HELPERS (SAME API)
========================= */
>>>>>>> 2cd663c (Ready for Deployment with reduced errors)

export const getCachedData = async (key) => {
  try {
    const data = await redisClient.get(key);
<<<<<<< HEAD
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("❌ Redis get failed:", error);
=======
    return data ?? null;
  } catch (error) {
    console.error("Redis GET error:", error);
>>>>>>> 2cd663c (Ready for Deployment with reduced errors)
    return null;
  }
};

<<<<<<< HEAD
export const setCachedData = async (key, data, expirationInSeconds = 3600) => {
  try {
    await redisClient.setEx(key, expirationInSeconds, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error("❌ Redis set failed:", error);
=======
export const setCachedData = async (
  key,
  data,
  expirationInSeconds = 3600
) => {
  try {
    await redisClient.set(key, data, { ex: expirationInSeconds });
    return true;
  } catch (error) {
    console.error("Redis SET error:", error);
>>>>>>> 2cd663c (Ready for Deployment with reduced errors)
    return false;
  }
};

export const deleteCachedData = async (key) => {
  try {
    await redisClient.del(key);
    return true;
  } catch (error) {
<<<<<<< HEAD
    console.error("❌ Redis delete failed:", error);
=======
    console.error("Redis DEL error:", error);
>>>>>>> 2cd663c (Ready for Deployment with reduced errors)
    return false;
  }
};

<<<<<<< HEAD
export const deleteCachedDataByPattern = async (pattern) => {
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
    return true;
  } catch (error) {
    console.error("❌ Redis delete by pattern failed:", error);
=======
/**
 * ⚠️ Upstash does NOT support KEYS *
 * This is implemented using SCAN internally
 */
export const deleteCachedDataByPattern = async (pattern) => {
  try {
    let cursor = 0;

    do {
      const [nextCursor, keys] = await redisClient.scan(cursor, {
        match: pattern,
        count: 100,
      });

      cursor = Number(nextCursor);

      if (keys.length > 0) {
        await redisClient.del(...keys);
      }
    } while (cursor !== 0);

    return true;
  } catch (error) {
    console.error("Redis PATTERN DEL error:", error);
>>>>>>> 2cd663c (Ready for Deployment with reduced errors)
    return false;
  }
};

export default redisClient;
