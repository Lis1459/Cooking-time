import { CommentRepository } from "../repositories/commentRepository.js";
import redisClient from "../config/redis.js";

const commentRepo = new CommentRepository();
const CACHE_TTL = 3600;

export class CommentService {
  async getCommentById(id) {
    const comment = await commentRepo.findById(id);
    if (!comment) {
      throw new Error("Comment not found");
    }
    return comment;
  }

  async getCommentsByRecipe(recipeId, page, limit) {
    const cacheKey = `comments:${recipeId}:${page}:${limit}`;
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const comments = await commentRepo.findByRecipe(recipeId, page, limit);
    const total = await commentRepo.countByRecipe(recipeId);

    const result = { comments, total, page, limit };
    await redisClient.setEx(cacheKey, CACHE_TTL, JSON.stringify(result));
    return result;
  }

  async getCommentsByUser(userId, page, limit) {
    return await commentRepo.findByUserId(userId, page, limit);
  }

  async createComment(commentData) {
    const comment = await commentRepo.create(commentData);
    // Invalidate cache
    await redisClient.del(`comments:${commentData.recipe_id}:*`);
    return comment;
  }

  async updateComment(id, data) {
    const comment = await commentRepo.update(id, data);
    // Invalidate cache
    if (comment) {
      await redisClient.del(`comments:${comment.recipe_id}:*`);
    }
    return comment;
  }

  async deleteComment(id) {
    const comment = await commentRepo.findById(id);
    if (comment) {
      await commentRepo.delete(id);
      await redisClient.del(`comments:${comment.recipe_id}:*`);
      return { id };
    }
    throw new Error("Comment not found");
  }
}
