import { UserRepository } from "../repositories/userRepository.js";
import redisClient from "../config/redis.js";

const userRepo = new UserRepository();
const CACHE_TTL = 3600; // 1 hour

export class UserService {
  async getUserById(id) {
    const cacheKey = `user:${id}`;
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const user = await userRepo.findById(id);
    if (!user) {
      throw new Error("User not found");
    }
    if (user) {
      await redisClient.setEx(cacheKey, CACHE_TTL, JSON.stringify(user));
    }
    return user;
  }

  async updateUser(id, userData) {
    const updatedUser = await userRepo.update(id, userData);
    // Invalidate cache
    await redisClient.del(`user:${id}`);
    return updatedUser;
  }

  async updateUserProfile(id, profileData) {
    const updatedUser = await userRepo.update(id, {
      profile: {
        update: profileData,
      },
    });
    // Invalidate cache
    await redisClient.del(`user:${id}`);
    return updatedUser;
  }

  async getAllUsers(page, limit) {
    return userRepo.findAllUsers(page, limit);
  }

  async blockUser(id) {
    const user = await userRepo.update(id, { is_blocked: true });
    await redisClient.del(`user:${id}`);
    return user;
  }

  async unblockUser(id) {
    const user = await userRepo.update(id, { is_blocked: false });
    await redisClient.del(`user:${id}`);
    return user;
  }

  async deleteUser(id) {
    await redisClient.del(`user:${id}`);
    return userRepo.delete(id);
  }
}
