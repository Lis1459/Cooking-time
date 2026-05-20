import { safeRedis } from "../config/redis.js";
import { RatingRepository } from "../repositories/ratingRepository.js";

const ratingRepo = new RatingRepository();
const CACHE_TTL = 3600; // 1 hour

export class RatingService {
  async getRecipeRating(recipeId) {
    try {
      const cacheKey = `recipe_rating_${recipeId}`;
      const cachedRating = await safeRedis.get(cacheKey);
      if (cachedRating) {
        return JSON.parse(cachedRating);
      }

      const result = await ratingRepo.getAggregate(recipeId);
      const ratingData = {
        average: result._avg.rating ?? 0,
        total: result._count.rating,
      };
      await safeRedis.setEx(cacheKey, CACHE_TTL, JSON.stringify(ratingData));
      return ratingData;
    } catch (error) {
      throw error;
    }
  }

  async upsertRecipeRating(recipeId, userId, score) {
    try {
      const rating = await ratingRepo.upsert(recipeId, userId, score);
      const cacheKey = `recipe_rating_${recipeId}`;
      await safeRedis.del(cacheKey);
      return rating;
    } catch (error) {
      throw error;
    }
  }

  async getUsersRating(recipeId, userId) {
    try {
      const rating = await ratingRepo.get(recipeId, userId);
      return rating;
    } catch (error) {
      throw error;
    }
  }
}
