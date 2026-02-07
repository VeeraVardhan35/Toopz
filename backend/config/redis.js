import { createClient } from "redis";
import { Redis } from "@upstash/redis";

const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

const redisClient = upstashUrl && upstashToken
  ? new Redis({ url: upstashUrl, token: upstashToken })
  : createClient({
      url: process.env.REDIS_URL || "redis://localhost:6379",
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            return new Error("Too many retries");
          }
          return retries * 100;
        },
      },
    });

if ("connect" in redisClient) {
  redisClient.on("error", (err) => {
    console.error("❌ Redis error:", err);
  });

  redisClient.on("connect", () => {
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
}

export const getCachedData = async (key) => {
  try {
    const data = await redisClient.get(key);
    if (typeof data === "string") {
      return JSON.parse(data);
    }
    return data ?? null;
  } catch (error) {
    console.error("Redis GET error:", error);
    return null;
  }
};

export const setCachedData = async (key, data, expirationInSeconds = 3600) => {
  try {
    if ("setEx" in redisClient) {
      await redisClient.setEx(key, expirationInSeconds, JSON.stringify(data));
    } else {
      await redisClient.set(key, data, { ex: expirationInSeconds });
    }
    return true;
  } catch (error) {
    console.error("Redis SET error:", error);
    return false;
  }
};

export const deleteCachedData = async (key) => {
  try {
    await redisClient.del(key);
    return true;
  } catch (error) {
    console.error("Redis DEL error:", error);
    return false;
  }
};

export const deleteCachedDataByPattern = async (pattern) => {
  try {
    if ("keys" in redisClient) {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(keys);
      }
      return true;
    }

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
    return false;
  }
};

export default redisClient;
