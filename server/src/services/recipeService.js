import { RecipeRepository } from "../repositories/recipeRepository.js";
import { FavoriteRepository } from "../repositories/favoriteRepository.js";
import parseCookStatus from "../utils/recipeUtils.js";
import { safeRedis } from "../config/redis.js";
import prisma from "../config/database.js";
import { capitalizeFirst } from "./../utils/formatter.js";

const recipeRepo = new RecipeRepository();
const favoriteRepo = new FavoriteRepository();
const CACHE_TTL = 3600; // 1 hour

export class RecipeService {
  async getRecipeById(id, userId = null) {
    const cacheKey = `recipe:${id}`;
    const cached = await safeRedis.get(cacheKey);

    let recipe;
    if (cached) {
      recipe = JSON.parse(cached);
    } else {
      recipe = await recipeRepo.findById(id);
      if (!recipe) {
        throw new Error("Recipe not found");
      }
      if (recipe) {
        await safeRedis.setEx(cacheKey, CACHE_TTL, JSON.stringify(recipe));
      }
    }

    let isFavorite = false;
    let cookMark = null;

    if (userId) {
      isFavorite = await favoriteRepo.exists(userId, id);
      cookMark = await recipeRepo.getCookMark(userId, id);
    }

    return {
      ...recipe,
      isFavorite,
      cookMark,
    };
  }

  async getRecipes(filters, page, limit) {
    const cacheKey = `recipes:${JSON.stringify(filters)}:${page}:${limit}`;
    const cached = await safeRedis.get(cacheKey);
    if (cached) {
      console.log("redis detached");
      return JSON.parse(cached);
    }
    console.log("recipe filters: ", filters);
    const recipes = await recipeRepo.findAll(filters, page, limit);
    const total = await recipeRepo.count(filters);

    const result = { recipes, total, page, limit };
    await safeRedis.setEx(cacheKey, CACHE_TTL, JSON.stringify(result));
    return result;
  }

  async createRecipe(recipeData) {
    const ingredientsData =
      typeof recipeData.ingredients === "string"
        ? JSON.parse(recipeData.ingredients)
        : recipeData.ingredients || [];

    const recipeIngredients = [];

    for (const ingredientEntry of ingredientsData) {
      let ingredientId = null;
      if (
        ingredientEntry.ingredient_id !== undefined &&
        ingredientEntry.ingredient_id !== null &&
        !Number.isNaN(Number(ingredientEntry.ingredient_id))
      ) {
        ingredientId = Number(ingredientEntry.ingredient_id);
      }

      if (!ingredientId && ingredientEntry.ingredient_name) {
        const existingIngredient = await prisma.ingredient.findFirst({
          where: {
            name: {
              equals: ingredientEntry.ingredient_name,
              mode: "insensitive",
            },
          },
        });
        if (existingIngredient) {
          ingredientId = existingIngredient.id;
        } else {
          const createdIngredient = await prisma.ingredient.create({
            data: {
              name: capitalizeFirst(ingredientEntry.ingredient_name),
              status: "NotVerified",
            },
          });
          ingredientId = createdIngredient.id;
        }
      }

      if (!ingredientId) {
        throw new Error("Ingredient is required");
      }

      recipeIngredients.push({
        ingredient: {
          connect: { id: ingredientId },
        },
        amount: Number(ingredientEntry.amount),
        unit: ingredientEntry.unit,
      });
    }

    const recipe = await recipeRepo.create({
      ...recipeData,
      status: "PENDING",
      ingredients: {
        create: recipeIngredients,
      },
    });

    await safeRedis.del("popular_recipes");
    return recipe;
  }

  async updateRecipe(id, data) {
    const recipe = await recipeRepo.update(id, data);
    await safeRedis.del(`recipe:${id}`);
    return recipe;
  }

  async deleteRecipe(id) {
    await recipeRepo.delete(id);
    await safeRedis.del(`recipe:${id}`);
    await safeRedis.del("popular_recipes");
  }

  async approveRecipe(recipeId) {
    const recipe = await recipeRepo.findByIdWithIngredients(recipeId);
    if (!recipe) {
      throw new Error("Recipe not found");
    }

    const ingredientIdsToVerify = recipe.ingredients
      .map((ri) => ri.ingredient)
      .filter((ingredient) => ingredient.status === "NotVerified")
      .map((ingredient) => ingredient.id);

    await prisma.$transaction([
      prisma.recipe.update({
        where: { id: parseInt(recipeId) },
        data: { status: "PUBLISHED" },
      }),
      prisma.ingredient.updateMany({
        where: { id: { in: ingredientIdsToVerify } },
        data: { status: "Verified" },
      }),
    ]);

    await safeRedis.del(`recipe:${recipeId}`);
    await safeRedis.del("popular_recipes");
  }

  async rejectRecipe(recipeId) {
    const recipe = await recipeRepo.findByIdWithIngredients(recipeId);
    if (!recipe) {
      throw new Error("Recipe not found");
    }

    const notVerifiedIngredientIds = recipe.ingredients
      .map((ri) => ri.ingredient)
      .filter((ingredient) => ingredient.status === "NotVerified")
      .map((ingredient) => ingredient.id);

    await prisma.$transaction(async (tx) => {
      await tx.recipe.delete({ where: { id: parseInt(recipeId) } });

      for (const ingredientId of notVerifiedIngredientIds) {
        const count = await tx.recipeIngredients.count({
          where: {
            ingredient_id: ingredientId,
            recipe_id: { not: parseInt(recipeId) },
          },
        });
        if (count === 0) {
          await tx.ingredient.delete({ where: { id: ingredientId } });
        }
      }
    });

    await safeRedis.del(`recipe:${recipeId}`);
    await safeRedis.del("popular_recipes");
  }

  async getPopularRecipes(limit = 10) {
    const cacheKey = "popular_recipes";
    const cached = await safeRedis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const recipes = await recipeRepo.getPopular(limit);
    await safeRedis.setEx(cacheKey, CACHE_TTL, JSON.stringify(recipes));
    return recipes;
  }

  async getAllRecipes(page, limit) {
    return await this.getRecipes({}, page, limit);
  }

  async markRecipeStatus(userId, recipeId, statusFromFrontend) {
    try {
      const status = parseCookStatus(statusFromFrontend);
      const result = await recipeRepo.markRecipeStatus(
        userId,
        recipeId,
        status,
      );

      await safeRedis.del(`recipe:${recipeId}`);

      return result;
    } catch (err) {
      console.log("Error marking recipe status:", err.message);
      throw err;
    }
  }

  async getRecipesByUser(userId, page, limit) {
    const recipes = await recipeRepo.findByUserId(userId, page, limit);
    const total = await recipeRepo.count({ author_id: userId });
    return { recipes, total, page, limit };
  }

  async searchRecipes(query, page, limit) {
    return await recipeRepo.search(query, page, limit);
  }

  async getRecipesByCategory(categoryId, page, limit) {
    return await recipeRepo.findByCategory(categoryId, page, limit);
  }

  async getRecipesByCuisine(cuisineId, page, limit) {
    return await recipeRepo.findByCuisine(cuisineId, page, limit);
  }

  async getRecipesByTag(tagId, page, limit) {
    return await recipeRepo.findByTag(tagId, page, limit);
  }

  async getFavoriteRecipes(userId, page, limit) {
    return await recipeRepo.getFavorites(userId, page, limit);
  }

  async addToFavorites(userId, recipeId) {
    await prisma.favorite.create({
      data: { user_id: userId, recipe_id: parseInt(recipeId) },
    });
  }

  async removeFromFavorites(userId, recipeId) {
    await prisma.favorite.deleteMany({
      where: { user_id: userId, recipe_id: parseInt(recipeId) },
    });
  }

  async addCookHistory(userId, recipeId) {
    await prisma.cookHistory.create({
      data: { user_id: userId, recipe_id: parseInt(recipeId) },
    });
    return { user_id: userId, recipe_id: recipeId };
  }

  async getCookHistory(userId, page, limit) {
    return await recipeRepo.getCookHistory(userId, page, limit);
  }

  async rateRecipe(recipeId, userId, rating) {
    // Implementation for rating
  }

  async getRecipeRating(recipeId) {
    // Implementation for getting rating
    return { average: 0, count: 0 };
  }

  async searchByIngredients(ingredientIds, page = 1, limit = 10) {
    const cacheKey = `recipes:ingredients:${ingredientIds.sort().join(",")}:${page}:${limit}`;
    const cached = await safeRedis.get(cacheKey);
    // if (cached) {
    //   return JSON.parse(cached);
    // }

    const recipes = await recipeRepo.findByIngredients(
      ingredientIds,
      page,
      limit,
    );
    const total = await recipeRepo.countByIngredients(ingredientIds);

    const result = { recipes, total, page, limit };
    await safeRedis.setEx(cacheKey, CACHE_TTL, JSON.stringify(result));
    return result;
  }
}
