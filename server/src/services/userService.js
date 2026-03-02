import { UserRepository } from "../repositories/userRepository.js";
import { safeRedis } from "../config/redis.js";

const userRepo = new UserRepository();
const CACHE_TTL = 3600; // 1 hour

export class UserService {
  async getUserById(id) {
    const cacheKey = `user:${id}`;
    const cached = await safeRedis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const user = await userRepo.findById(id);
    if (!user) {
      throw new Error("User not found");
    }
    if (user) {
      await safeRedis.setEx(cacheKey, CACHE_TTL, JSON.stringify(user));
    }
    return user;
  }

  async updateUser(id, userData) {
    const updatedUser = await userRepo.update(id, userData);
    // Invalidate cache
    await safeRedis.del(`user:${id}`);
    return updatedUser;
  }

  async updateUserProfile(id, profileData) {
    const updatedUser = await userRepo.update(id, {
      profile: {
        update: profileData,
      },
    });
    // Invalidate cache
    await safeRedis.del(`user:${id}`);
    return updatedUser;
  }

  async getAllUsers(page, limit) {
    return userRepo.findAllUsers(page, limit);
  }

  async blockUser(id) {
    const user = await userRepo.update(id, { is_blocked: true });
    await safeRedis.del(`user:${id}`);
    return user;
  }

  async unblockUser(id) {
    const user = await userRepo.update(id, { is_blocked: false });
    await safeRedis.del(`user:${id}`);
    return user;
  }

  async deleteUser(id) {
    await safeRedis.del(`user:${id}`);
    return userRepo.delete(id);
  }
}
