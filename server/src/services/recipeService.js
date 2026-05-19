import { RecipeRepository } from "../repositories/recipeRepository.js";
import { FavoriteRepository } from "../repositories/favoriteRepository.js";
import parseCookStatus from "../utils/recipeUtils.js";
import { safeRedis } from "../config/redis.js";
import prisma from "../config/database.js";
import { capitalizeFirst } from "./../utils/formatter.js";

const recipeRepo = new RecipeRepository();
const favoriteRepo = new FavoriteRepository();
const CACHE_TTL = 3600; // 1 hour

const normalizeIds = (values) =>
  Array.isArray(values)
    ? values.map((value) => Number(value)).filter((id) => !Number.isNaN(id))
    : [];

const arraysAreEqual = (left = [], right = []) => {
  const normalizedLeft = normalizeIds(left).sort((a, b) => a - b);
  const normalizedRight = normalizeIds(right).sort((a, b) => a - b);
  if (normalizedLeft.length !== normalizedRight.length) return false;
  return normalizedLeft.every(
    (value, index) => value === normalizedRight[index],
  );
};

const parseRecipeIngredients = async (ingredientsData) => {
  const parsedIngredients =
    typeof ingredientsData === "string"
      ? JSON.parse(ingredientsData)
      : ingredientsData || [];

  const recipeIngredients = [];

  for (const ingredientEntry of parsedIngredients) {
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
      ingredient: { connect: { id: ingredientId } },
      amount: Number(ingredientEntry.amount),
      unit: ingredientEntry.unit,
    });
  }

  return recipeIngredients;
};

const getDraftChanges = (recipe, draftData) => {
  const changes = [];

  if (draftData.title && draftData.title !== recipe.title) {
    changes.push("Title");
  }
  if (draftData.description && draftData.description !== recipe.description) {
    changes.push("Description");
  }
  if (
    draftData.cooking_time &&
    Number(draftData.cooking_time) !== recipe.cooking_time
  ) {
    changes.push("Cooking time");
  }
  if (draftData.calories && Number(draftData.calories) !== recipe.calories) {
    changes.push("Calories");
  }
  if (draftData.difficulty && draftData.difficulty !== recipe.difficulty) {
    changes.push("Difficulty");
  }
  if (
    draftData.preview_img_url &&
    draftData.preview_img_url !== recipe.preview_img_url
  ) {
    changes.push("Image");
  }
  if (
    draftData.categories &&
    !arraysAreEqual(
      recipe.categories?.map((c) => c.id),
      draftData.categories,
    )
  ) {
    changes.push("Categories");
  }
  if (
    draftData.tags &&
    !arraysAreEqual(
      recipe.tags?.map((t) => t.id),
      draftData.tags,
    )
  ) {
    changes.push("Tags");
  }
  if (
    draftData.cuisines &&
    !arraysAreEqual(
      recipe.cuisines?.map((c) => c.id),
      draftData.cuisines,
    )
  ) {
    changes.push("Cuisines");
  }

  if (draftData.ingredients) {
    const currentIngredients = (recipe.ingredients || []).map((ing) => ({
      id: ing.ingredient?.id,
      name: ing.ingredient?.name,
      amount: Number(ing.amount),
      unit: ing.unit,
    }));
    const draftIngredients = JSON.parse(draftData.ingredients).map((ing) => ({
      id: ing.ingredient_id ? Number(ing.ingredient_id) : null,
      name: ing.ingredient_name,
      amount: Number(ing.amount),
      unit: ing.unit,
    }));
    if (
      JSON.stringify(currentIngredients) !== JSON.stringify(draftIngredients)
    ) {
      changes.push("Ingredients");
    }
  }

  console.log(recipe.steps);
  if (draftData.steps) {
    const currentSteps = (recipe.steps || []).map((step) => ({
      step_number: Number(step.step_number),
      description: step.description,
    }));
    const draftSteps = draftData.steps.create.map((step) => ({
      step_number: Number(step.step_number),
      description: step.description,
    }));
    if (JSON.stringify(currentSteps) !== JSON.stringify(draftSteps)) {
      changes.push("Steps");
    }
  }

  return changes;
};

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

  async getPendingRecipes(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const pendingRecipes = await prisma.recipe.findMany({
      where: { status: "PENDING" },
      include: {
        author: true,
        categories: true,
        tags: true,
        cuisines: true,
        ingredients: {
          include: { ingredient: true },
        },
        steps: true,
      },
      orderBy: { created_at: "desc" },
    });

    const draftEntries = await prisma.recipeDraft.findMany({
      include: {
        recipe: {
          include: {
            author: true,
            categories: true,
            tags: true,
            cuisines: true,
            ingredients: { include: { ingredient: true } },
            steps: true,
          },
        },
        editor: true,
      },
      orderBy: { created_at: "desc" },
    });

    const pendingEdits = draftEntries.map((draft) => {
      const recipe = draft.recipe;
      const changes = getDraftChanges(recipe, draft.data || {});
      return {
        ...recipe,
        draft: {
          id: draft.id,
          editor: { id: draft.editor?.id, name: draft.editor?.name },
          data: draft.data,
          created_at: draft.created_at,
          changes,
          pendingType: "edit",
        },
      };
    });

    const combined = [
      ...pendingRecipes.map((recipe) => ({
        ...recipe,
        draft: null,
        pendingType: "new",
      })),
      ...pendingEdits,
    ];

    const resultRecipes = combined.slice(skip, skip + limit);
    return {
      recipes: resultRecipes,
      total: combined.length,
      page,
      limit,
    };
  }

  async getRecipeWithDraftById(id) {
    const recipe = await recipeRepo.findById(id);
    if (!recipe) {
      throw new Error("Recipe not found");
    }

    const draft = await prisma.recipeDraft.findFirst({
      where: { recipe_id: parseInt(id) },
      include: { editor: true },
    });

    if (!draft) {
      return recipe;
    }

    const changes = getDraftChanges(recipe, draft.data || {});
    return {
      ...recipe,
      draft: {
        id: draft.id,
        editor: { id: draft.editor?.id, name: draft.editor?.name },
        data: draft.data,
        created_at: draft.created_at,
        changes,
        pendingType: "edit",
      },
    };
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

  async updateRecipe(id, data, user) {
    // If admin - apply immediately
    if (user && user.role === "ADMIN") {
      const updateData = { ...data };

      if (data.ingredients) {
        const recipeIngredients = await parseRecipeIngredients(
          data.ingredients,
        );
        updateData.ingredients = {
          deleteMany: {},
          create: recipeIngredients,
        };
      }

      if (data.steps) {
        let stepsArray = [];

        if (typeof data.steps === "string") {
          stepsArray = JSON.parse(data.steps);
        } else if (Array.isArray(data.steps)) {
          stepsArray = data.steps;
        } else if (data.steps.create) {
          stepsArray = Array.isArray(data.steps.create)
            ? data.steps.create
            : JSON.parse(data.steps.create);
        }

        updateData.steps = {
          deleteMany: {},
          create: stepsArray.map((step, idx) => ({
            description: step.description,
            step_number: Number(step.step_number ?? idx + 1),
            image_url: step.image_url,
          })),
        };
      }

      const normalizeRelation = (value) => {
        if (typeof value === "string") {
          return JSON.parse(value).map((id) => ({ id: Number(id) }));
        }
        if (Array.isArray(value)) {
          return value.map((id) => ({ id: Number(id) }));
        }
        if (value && value.set) {
          return value.set;
        }
        return null;
      };

      if (data.calories) {
        const calories = Number(data.calories);
        if (calories) {
          updateData.calories = calories;
        }
      }

      if (data.cooking_time) {
        const cooking_time = Number(data.cooking_time);
        if (cooking_time) {
          updateData.cooking_time = cooking_time;
        }
      }

      if (data.categories) {
        const categories = normalizeRelation(data.categories);
        if (categories) {
          updateData.categories = { set: categories };
        }
      }

      if (data.tags) {
        const tags = normalizeRelation(data.tags);
        if (tags) {
          updateData.tags = { set: tags };
        }
      }

      if (data.cuisines) {
        const cuisines = normalizeRelation(data.cuisines);
        if (cuisines) {
          updateData.cuisines = { set: cuisines };
        }
      }

      const recipe = await recipeRepo.update(id, updateData);
      await safeRedis.del(`recipe:${id}`);
      return recipe;
    }

    // Non-admin: save draft
    const recipeId = parseInt(id);

    const existingDraft = await prisma.recipeDraft.findFirst({
      where: { recipe_id: recipeId },
    });

    if (existingDraft) {
      await prisma.recipeDraft.update({
        where: { id: existingDraft.id },
        data: { data },
      });
    } else {
      await prisma.recipeDraft.create({
        data: {
          recipe: { connect: { id: recipeId } },
          editor: { connect: { id: user.id } },
          data,
        },
      });
    }

    await safeRedis.del(`recipe:${id}`);
    return { message: "Draft saved for approval" };
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

    // If there is a draft for this recipe, apply its data
    const draft = await prisma.recipeDraft.findFirst({
      where: { recipe_id: parseInt(recipeId) },
    });

    if (draft) {
      const draftData = draft.data || {};

      const updateData = {};
      if (draftData.title) updateData.title = draftData.title;
      if (draftData.description) updateData.description = draftData.description;
      if (draftData.preview_img_url)
        updateData.preview_img_url = draftData.preview_img_url;
      if (draftData.thumbnail) updateData.thumbnail = draftData.thumbnail;
      if (draftData.cooking_time)
        updateData.cooking_time = Number(draftData.cooking_time);
      if (draftData.calories) updateData.calories = Number(draftData.calories);
      if (draftData.difficulty) updateData.difficulty = draftData.difficulty;

      // Relations: ingredients, steps, categories, tags, cuisines
      console.log("draft data ingredients: ", draftData.ingredients);
      if (draftData.ingredients) {
        updateData.ingredients = {
          deleteMany: {},
          create: JSON.parse(draftData.ingredients).map((ing) => ({
            ingredient: { connect: { id: Number(ing.ingredient_id) } },
            amount: Number(ing.amount),
            unit: ing.unit,
          })),
        };
      }

      if (draftData.steps) {
        updateData.steps = {
          deleteMany: {},
          create: draftData.steps.map((s, idx) => ({
            description: s.description,
            step_number: Number(s.step_number ?? idx + 1),
          })),
        };
      }

      if (draftData.categories) {
        updateData.categories = {
          set: draftData.categories.map((id) => ({ id: Number(id) })),
        };
      }

      if (draftData.tags) {
        updateData.tags = {
          set: draftData.tags.map((id) => ({ id: Number(id) })),
        };
      }

      if (draftData.cuisines) {
        updateData.cuisines = {
          set: draftData.cuisines.map((id) => ({ id: Number(id) })),
        };
      }

      await prisma.$transaction([
        prisma.recipe.update({
          where: { id: parseInt(recipeId) },
          data: { ...updateData, status: "PUBLISHED" },
        }),
        prisma.ingredient.updateMany({
          where: { id: { in: ingredientIdsToVerify } },
          data: { status: "Verified" },
        }),
        prisma.recipeDraft.delete({ where: { id: draft.id } }),
      ]);
    } else {
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
    }

    await safeRedis.del(`recipe:${recipeId}`);
    await safeRedis.del("popular_recipes");
  }

  async rejectRecipe(recipeId) {
    // If there's a draft for this recipe, just delete the draft (reject edit)
    const draft = await prisma.recipeDraft.findFirst({
      where: { recipe_id: parseInt(recipeId) },
    });

    if (draft) {
      await prisma.recipeDraft.delete({ where: { id: draft.id } });
      await safeRedis.del(`recipe:${recipeId}`);
      return;
    }

    // Otherwise treat as rejecting a pending recipe creation -> delete recipe
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
