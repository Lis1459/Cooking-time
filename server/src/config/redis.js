import { createClient } from "redis";

const redisHost = process.env.REDIS_HOST || "127.0.0.1";
const redisPort = process.env.REDIS_PORT || 6379;
const redisUrl = process.env.REDIS_URL || `redis://${redisHost}:${redisPort}`;

const redisClient = createClient({
  url: redisUrl,
  socket: {
    // connection timeout in ms
    connectTimeout: 10000,
    // keep the socket alive (initialDelay ms)
    keepAlive: 30000,
    // reconnect strategy: linear backoff capped to 3s
    reconnectStrategy: (retries) => Math.min(retries * 100, 3000),
  },
  // allow node-redis to retry commands; avoid infinite retry loops in some cases
  maxRetriesPerRequest: 5,
  // don't open connection automatically; we control initial connect
  lazyConnect: true,
});

redisClient.on("error", (err) => {
  console.error("Redis Client Error:", err);
});

redisClient.on("connect", () => {
  console.log("Redis connected successfully");
});

redisClient.on("ready", () => {
  console.log("Redis ready");
});

redisClient.on("end", () => {
  console.log("Redis disconnected");
});

redisClient.on("reconnecting", (delay) => {
  console.log(`Redis reconnecting, next attempt in ${delay}ms`);
});

// Initialize Redis connection
export async function initializeRedis() {
  if (!redisClient.isOpen) {
    try {
      await redisClient.connect();
      console.log("Redis initialized successfully");
    } catch (err) {
      console.error(
        "Failed to connect to Redis:",
        err && err.message ? err.message : err,
      );
      console.warn("Continuing without Redis cache...");
      // Don't throw - allow server to run without Redis
    }
  }
  return redisClient;
}

// Safe Redis wrapper - DISABLED (Redis temporarily bypassed)
// All methods are no-ops, forcing code to always fetch from DB
console.warn(
  "⚠️  Redis is DISABLED - all requests will bypass cache and go to database",
);

export const safeRedis = {
  async get(key) {
    // Always return null = cache miss, will fetch from DB
    return null;
  },

  async set(key, value, options = {}) {
    // No-op: don't cache anything
  },

  async setEx(key, seconds, value) {
    // No-op: don't cache anything
  },

  async del(...keys) {
    // No-op: nothing to delete
  },

  async exists(key) {
    // Always return false: key doesn't exist
    return false;
  },

  async incr(key) {
    // Always return 0
    return 0;
  },

  async expire(key, seconds) {
    // No-op: nothing to expire
  },

  isConnected() {
    // Always return false: Redis is disabled
    return false;
  },
};

export default safeRedis;
