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

export const getCachedData = async (key) => {
  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("❌ Redis get failed:", error);
    return null;
  }
};

export const setCachedData = async (key, data, expirationInSeconds = 3600) => {
  try {
    await redisClient.setEx(key, expirationInSeconds, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error("❌ Redis set failed:", error);
    return false;
  }
};

export const deleteCachedData = async (key) => {
  try {
    await redisClient.del(key);
    return true;
  } catch (error) {
    console.error("❌ Redis delete failed:", error);
    return false;
  }
};

export const deleteCachedDataByPattern = async (pattern) => {
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
    return true;
  } catch (error) {
    console.error("❌ Redis delete by pattern failed:", error);
    return false;
  }
};

export default redisClient;
