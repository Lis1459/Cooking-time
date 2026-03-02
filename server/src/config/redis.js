import { createClient } from "redis";

const redisClient = createClient({
  // url: process.env.REDIS_URL || "redis://localhost:6379",
  socket: {
    host: process.env.REDIS_HOST || "localhost",
    port: process.env.REDIS_PORT || 6379,
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        console.error("Max reconnection attempts reached");
        return new Error("Max retries reached");
      }
      return Math.min(retries * 50, 500);
    },
    connectTimeout: 10000,
    keepAlive: 30000,
  },
  lazyConnect: true,
});

let isConnected = false;

redisClient.on("error", (err) => {
  console.error("Redis Client Error:", err);
  isConnected = false;
});

redisClient.on("connect", () => {
  console.log("Redis connected successfully");
  isConnected = true;
});

redisClient.on("ready", () => {
  console.log("Redis ready");
});

redisClient.on("end", () => {
  console.log("Redis disconnected");
  isConnected = false;
});

// Initialize Redis connection
export async function initializeRedis() {
  if (!isConnected) {
    try {
      await redisClient.connect();
      isConnected = true;
      console.log("Redis initialized successfully");
    } catch (err) {
      console.error("Failed to connect to Redis:", err.message);
      console.warn("Continuing without Redis cache...");
      // Don't throw - allow server to run without Redis
    }
  }
  return redisClient;
}

// Safe Redis wrapper - handles errors gracefully
export const safeRedis = {
  async get(key) {
    try {
      if (!isConnected) return null;
      return await redisClient.get(key);
    } catch (err) {
      console.warn(`Redis GET error for key ${key}:`, err.message);
      return null;
    }
  },

  async set(key, value, options = {}) {
    try {
      if (!isConnected) return;
      return await redisClient.set(key, value, options);
    } catch (err) {
      console.warn(`Redis SET error for key ${key}:`, err.message);
    }
  },

  async setEx(key, seconds, value) {
    try {
      if (!isConnected) return;
      return await redisClient.setEx(key, seconds, value);
    } catch (err) {
      console.warn(`Redis SETEX error for key ${key}:`, err.message);
    }
  },

  async del(...keys) {
    try {
      if (!isConnected) return;
      return await redisClient.del(keys);
    } catch (err) {
      console.warn(`Redis DEL error for keys ${keys}:`, err.message);
    }
  },

  async exists(key) {
    try {
      if (!isConnected) return false;
      return await redisClient.exists(key);
    } catch (err) {
      console.warn(`Redis EXISTS error for key ${key}:`, err.message);
      return false;
    }
  },

  async incr(key) {
    try {
      if (!isConnected) return 0;
      return await redisClient.incr(key);
    } catch (err) {
      console.warn(`Redis INCR error for key ${key}:`, err.message);
      return 0;
    }
  },

  async expire(key, seconds) {
    try {
      if (!isConnected) return;
      return await redisClient.expire(key, seconds);
    } catch (err) {
      console.warn(`Redis EXPIRE error for key ${key}:`, err.message);
    }
  },

  isConnected() {
    return isConnected;
  },
};

export default safeRedis;
