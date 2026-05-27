import { CommentRepository } from "../repositories/commentRepository.js";
import { safeRedis } from "../config/redis.js";
import prisma from "../config/database.js";
import { NotificationService } from "./notificationService.js";
import { RecipeService } from "./recipeService.js";

const commentRepo = new CommentRepository();
const notificationService = new NotificationService();
const recipeService = new RecipeService();
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
    const cached = await safeRedis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const comments = await commentRepo.findByRecipe(recipeId, page, limit);
    const total = await commentRepo.countByRecipe(recipeId);

    const result = { comments, total, page, limit };
    await safeRedis.setEx(cacheKey, CACHE_TTL, JSON.stringify(result));
    return result;
  }

  async getCommentsByUser(userId, page, limit) {
    return await commentRepo.findByUserId(userId, page, limit);
  }

  async createComment(commentData) {
    const comment = await commentRepo.create(commentData);

    if (comment) {
      const recipe = await prisma.recipe.findUnique({
        where: { id: commentData.recipe_id },
        select: { author_id: true },
      });
      if (recipe && recipe.author_id !== commentData.user_id) {
        await notificationService.createNotification({
          user_id: recipe.author_id,
          initiator_id: commentData.user_id,
          type: "NEW_COMMENT",
          entity_id: String(comment.id),
          message: `Новый комментарий к вашему рецепту: "${comment.text.slice(0, 120)}"`,
        });
      }
    }

    await recipeService.recalculatePopularity(commentData.recipe_id);
    await safeRedis.del(`comments:${commentData.recipe_id}:*`);
    await safeRedis.del("popular_recipes");
    return comment;
  }

  async updateComment(id, data) {
    const comment = await commentRepo.update(id, data);
    // Invalidate cache
    if (comment) {
      await safeRedis.del(`comments:${comment.recipe_id}:*`);
    }
    return comment;
  }

  async deleteComment(id) {
    const comment = await commentRepo.findById(id);
    if (comment) {
      await commentRepo.delete(id);
      await recipeService.recalculatePopularity(comment.recipe_id);
      await safeRedis.del(`comments:${comment.recipe_id}:*`);
      await safeRedis.del("popular_recipes");
      return { id };
    }
    throw new Error("Comment not found");
  }
}
