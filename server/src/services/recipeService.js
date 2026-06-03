import { RecipeRepository } from "../repositories/recipeRepository.js";
import { FavoriteRepository } from "../repositories/favoriteRepository.js";
import parseCookStatus from "../utils/recipeUtils.js";
import { safeRedis } from "../config/redis.js";
import prisma from "../config/database.js";
import { capitalizeFirst } from "./../utils/formatter.js";
import { NotificationService } from "./notificationService.js";

const recipeRepo = new RecipeRepository();
const favoriteRepo = new FavoriteRepository();
const notificationService = new NotificationService();
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

const calculatePopularityScore = ({
  favorites = 0,
  comments = 0,
  views = 0,
  created_at,
}) => {
  const createdAt = new Date(created_at).getTime();
  const now = Date.now();
  const daysSinceCreated = Math.max((now - createdAt) / 86400000, 0);
  const freshnessFactor = 1 / (1 + daysSinceCreated * 0.1);
  return (favorites * 4 + comments * 6 + views * 1) * freshnessFactor;
};

const enrichRecipesWithUserMetadata = async (recipes, userId) => {
  console.log("enrich data: ", userId, " ", recipes.length);
  if (!recipes || recipes.length === 0) {
    return recipes;
  }

  const recipeIds = recipes.map((recipe) => recipe.id);

  const [favoriteRecords, cookHistoryRecords, ratingGroups] = await Promise.all(
    [
      userId
        ? prisma.favorite.findMany({
            where: {
              user_id: userId,
              recipe_id: { in: recipeIds },
            },
            select: { recipe_id: true },
          })
        : Promise.resolve([]),
      userId
        ? prisma.cookHistory.findMany({
            where: {
              user_id: userId,
              recipe_id: { in: recipeIds },
            },
            select: {
              recipe_id: true,
              status: true,
            },
          })
        : Promise.resolve([]),
      prisma.rating.groupBy({
        by: ["recipe_id"],
        where: { recipe_id: { in: recipeIds } },
        _avg: { rating: true },
        _count: { rating: true },
      }),
    ],
  );

  const favoriteMap = new Map(
    favoriteRecords.map((record) => [record.recipe_id, true]),
  );
  const cookHistoryMap = new Map(
    cookHistoryRecords.map((record) => [record.recipe_id, record.status]),
  );
  const ratingMap = new Map(
    ratingGroups.map((group) => [
      group.recipe_id,
      {
        average: group._avg.rating ?? 0,
        total: group._count.rating,
      },
    ]),
  );

  return recipes.map((recipe) => ({
    ...recipe,
    isFavorite: favoriteMap.has(recipe.id),
    cookMark: cookHistoryMap.get(recipe.id) || null,
    rating: ratingMap.get(recipe.id) || { average: 0, total: 0 },
  }));
};

const getCookingTimeBucket = (cookingTime) => {
  if (cookingTime <= 20) return "very_short";
  if (cookingTime <= 40) return "short";
  if (cookingTime <= 60) return "medium";
  return "long";
};

const addWeightedCount = (map, key, weight) => {
  if (!key) return;
  map[key] = (map[key] || 0) + weight;
};

const normalizeDraftIds = (value) => {
  if (!value) return [];
  if (typeof value === "string") {
    try {
      return JSON.parse(value)
        .map((id) => Number(id))
        .filter((id) => !Number.isNaN(id));
    } catch {
      return [];
    }
  }
  if (Array.isArray(value)) {
    return value
      .map((item) =>
        item && typeof item === "object" && "id" in item
          ? Number(item.id)
          : Number(item),
      )
      .filter((id) => !Number.isNaN(id));
  }
  if (value.set) return normalizeDraftIds(value.set);
  if (value.connect) return normalizeDraftIds(value.connect);
  return [];
};

const normalizeDraftSteps = (stepsValue) => {
  if (!stepsValue) return [];
  let steps = [];

  if (typeof stepsValue === "string") {
    try {
      steps = JSON.parse(stepsValue);
    } catch {
      steps = [];
    }
  } else if (Array.isArray(stepsValue)) {
    steps = stepsValue;
  } else if (stepsValue.create) {
    steps = Array.isArray(stepsValue.create) ? stepsValue.create : [];
  }

  return steps
    .map((step, idx) => ({
      description: step.description,
      step_number: Number(step.step_number ?? idx + 1),
      image_url: step.image_url,
    }))
    .sort((a, b) => a.step_number - b.step_number);
};

const normalizeDraftIngredients = (value) => {
  if (!value) return [];
  const ingredients =
    typeof value === "string" ? JSON.parse(value) : value || [];

  return ingredients.map((ing) => ({
    id: ing.ingredient_id ? Number(ing.ingredient_id) : null,
    name: ing.ingredient_name,
    amount: Number(ing.amount),
    unit: ing.unit,
  }));
};

const normalizeRelationForCreate = (value) => {
  if (value === undefined || value === null) return undefined;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return normalizeRelationForCreate(parsed);
    } catch {
      return undefined;
    }
  }
  if (Array.isArray(value)) {
    const ids = value
      .map((id) => (typeof id === "object" ? id?.id : id))
      .map((id) => Number(id))
      .filter((id) => !Number.isNaN(id));
    return ids.map((id) => ({ id }));
  }
  if (value.connect) return normalizeRelationForCreate(value.connect);
  if (value.set) return normalizeRelationForCreate(value.set);
  return undefined;
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
  const draftCategoryIds = normalizeDraftIds(draftData.categories);
  const draftTagIds = normalizeDraftIds(draftData.tags);
  const draftCuisineIds = normalizeDraftIds(draftData.cuisines);

  const hasDraftCategories =
    draftData.categories !== undefined && draftData.categories !== null;
  const hasDraftTags = draftData.tags !== undefined && draftData.tags !== null;
  const hasDraftCuisines =
    draftData.cuisines !== undefined && draftData.cuisines !== null;

  if (
    hasDraftCategories &&
    !arraysAreEqual(
      recipe.categories?.map((c) => c.id),
      draftCategoryIds,
    )
  ) {
    changes.push("Categories");
  }
  if (
    hasDraftTags &&
    !arraysAreEqual(
      recipe.tags?.map((t) => t.id),
      draftTagIds,
    )
  ) {
    changes.push("Tags");
  }
  if (
    hasDraftCuisines &&
    !arraysAreEqual(
      recipe.cuisines?.map((c) => c.id),
      draftCuisineIds,
    )
  ) {
    changes.push("Cuisines");
  }

  if (draftData.ingredients) {
    const currentIngredients = normalizeDraftIngredients(
      recipe.ingredients || [],
    )
      .slice()
      .sort((a, b) => {
        if (a.id !== b.id) return (a.id ?? 0) - (b.id ?? 0);
        if (a.name !== b.name) return a.name.localeCompare(b.name);
        if (a.amount !== b.amount) return a.amount - b.amount;
        return a.unit.localeCompare(b.unit);
      });
    const draftIngredients = normalizeDraftIngredients(draftData.ingredients)
      .slice()
      .sort((a, b) => {
        if (a.id !== b.id) return (a.id ?? 0) - (b.id ?? 0);
        if (a.name !== b.name) return a.name.localeCompare(b.name);
        if (a.amount !== b.amount) return a.amount - b.amount;
        return a.unit.localeCompare(b.unit);
      });
    if (
      JSON.stringify(currentIngredients) !== JSON.stringify(draftIngredients)
    ) {
      changes.push("Ingredients");
    }
  }

  if (draftData.steps) {
    const currentSteps = normalizeDraftSteps(recipe.steps || []);
    const draftSteps = normalizeDraftSteps(draftData.steps);
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

  async getRecipes(filters, page, limit, userId) {
    const cacheKey = `recipes:${JSON.stringify(filters)}:${page}:${limit}:${userId || "anon"}`;
    const cached = await safeRedis.get(cacheKey);
    if (cached) {
      console.log("redis detached");
      return JSON.parse(cached);
    }
    console.log("userId: ", userId);
    const recipes = await recipeRepo.findAll(filters, page, limit, userId);
    const total = await recipeRepo.count(filters);
    const enrichedRecipes = await enrichRecipesWithUserMetadata(
      recipes,
      userId,
    );

    const result = { recipes: enrichedRecipes, total, page, limit };
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

    if (recipeData.categories && !recipeData.categories.connect) {
      const categories = normalizeRelationForCreate(recipeData.categories);
      if (categories) {
        recipeData.categories = { connect: categories };
      }
    }
    if (recipeData.tags && !recipeData.tags.connect) {
      const tags = normalizeRelationForCreate(recipeData.tags);
      if (tags) {
        recipeData.tags = { connect: tags };
      }
    }
    if (recipeData.cuisines && !recipeData.cuisines.connect) {
      const cuisines = normalizeRelationForCreate(recipeData.cuisines);
      if (cuisines) {
        recipeData.cuisines = { connect: cuisines };
      }
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
    // Load existing recipe for permission checks
    const recipe = await recipeRepo.findById(id);

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
        if (value === undefined || value === null) return null;
        if (typeof value === "string") {
          try {
            const parsed = JSON.parse(value);
            return normalizeRelation(parsed);
          } catch {
            return null;
          }
        }
        if (Array.isArray(value)) {
          return value
            .map((id) => (typeof id === "object" ? id?.id : id))
            .map((id) => Number(id))
            .filter((id) => !Number.isNaN(id))
            .map((id) => ({ id }));
        }
        if (value && value.set) {
          return normalizeRelation(value.set);
        }
        if (value && value.connect) {
          return normalizeRelation(value.connect);
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

      const updated = await recipeRepo.update(id, updateData);
      await safeRedis.del(`recipe:${id}`);

      // notify author if admin hid the recipe
      try {
        if (updateData.status === "HIDDEN") {
          await notificationService.createNotification({
            user_id: updated.author_id,
            initiator_id: user.id,
            type: "RECIPE_HIDDEN",
            entity_id: String(id),
            message: `Ваш рецепт "${updated.title}" был скрыт модератором.`,
          });
        }
      } catch (e) {
        console.error("Failed to create hide notification:", e.message);
      }

      return updated;
    }

    // Non-admin: if owner requests only status change, allow immediate status update
    const recipeId = parseInt(id);
    if (data && data.status && user && recipe && recipe.author_id === user.id) {
      const updated = await recipeRepo.update(id, { status: data.status });
      await safeRedis.del(`recipe:${id}`);
      await safeRedis.del("popular_recipes");
      return updated;
    }

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

    const isNewPublication = recipe.status !== "PUBLISHED";
    const authorId = recipe.author_id;

    // If there is a draft for this recipe, apply its data
    const draft = await prisma.recipeDraft.findFirst({
      where: { recipe_id: parseInt(recipeId) },
    });

    let newTitle = recipe.title;
    if (draft) {
      const draftData = draft.data || {};

      if (draftData.title) newTitle = draftData.title;

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
          create: draftData.steps.create.map((s, idx) => ({
            description: s.description,
            step_number: Number(s.step_number ?? idx + 1),
          })),
        };
      }

      const draftCategoryIds = normalizeDraftIds(draftData.categories);
      const draftTagIds = normalizeDraftIds(draftData.tags);
      const draftCuisineIds = normalizeDraftIds(draftData.cuisines);

      if (draftData.categories !== undefined && draftData.categories !== null) {
        updateData.categories = {
          set: draftCategoryIds.map((id) => ({ id })),
        };
      }

      if (draftData.tags !== undefined && draftData.tags !== null) {
        updateData.tags = {
          set: draftTagIds.map((id) => ({ id })),
        };
      }

      if (draftData.cuisines !== undefined && draftData.cuisines !== null) {
        updateData.cuisines = {
          set: draftCuisineIds.map((id) => ({ id })),
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

    await notificationService.createNotification({
      user_id: authorId,
      initiator_id: authorId,
      type: "RECIPE_APPROVED",
      entity_id: String(recipeId),
      message: `Ваш рецепт "${newTitle}" прошёл модерацию и опубликован.`,
    });

    if (isNewPublication) {
      const followers = await prisma.subscription.findMany({
        where: { author_id: authorId },
        select: { follower_id: true },
      });
      await Promise.all(
        followers.map((follow) =>
          notificationService.createNotification({
            user_id: follow.follower_id,
            initiator_id: authorId,
            type: "NEW_RECIPE_FROM_SUBSCRIPTION",
            entity_id: String(recipeId),
            message: `Пользователь опубликовал новый рецепт: "${newTitle}"`,
          }),
        ),
      );
    }
  }

  async rejectRecipe(recipeId, reason = "Причина не указана") {
    // If there's a draft for this recipe, just delete the draft (reject edit)
    const draft = await prisma.recipeDraft.findFirst({
      where: { recipe_id: parseInt(recipeId) },
    });

    if (draft) {
      const recipe = await recipeRepo.findByIdWithIngredients(recipeId);
      await prisma.recipeDraft.delete({ where: { id: draft.id } });
      await safeRedis.del(`recipe:${recipeId}`);

      if (recipe) {
        await notificationService.createNotification({
          user_id: recipe.author_id,
          initiator_id: recipe.author_id,
          type: "RECIPE_REJECTED",
          entity_id: String(recipeId),
          message: `Ваш рецепт "${recipe.title}" был отклонён. Причина: ${reason}`,
        });
      }
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

    await notificationService.createNotification({
      user_id: recipe.author_id,
      initiator_id: recipe.author_id,
      type: "RECIPE_REJECTED",
      entity_id: String(recipeId),
      message: `Ваш рецепт "${recipe.title}" был отклонён. Причина: ${reason}`,
    });
  }

  async getPopularRecipes(limit = 10, userId = null) {
    // Refresh dynamic popularity by time before returning top recipes
    await prisma.$executeRaw`
      UPDATE recipes
      SET popularity_score = (
        (COALESCE((SELECT COUNT(*) FROM favorites WHERE recipe_id = recipes.id), 0) * 4 + COALESCE((SELECT COUNT(*) FROM comments WHERE recipe_id = recipes.id AND is_hidden = false), 0) * 6 + views)
        * (1 / (1 + EXTRACT(epoch FROM now() - created_at) / 86400 * 0.1))
      )
      WHERE status = 'PUBLISHED'
    `;

    const cacheKey = `popular_recipes:${userId || "anon"}`;
    const cached = await safeRedis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const recipes = await recipeRepo.getPopular(limit);
    const enrichedRecipes = await enrichRecipesWithUserMetadata(
      recipes,
      userId,
    );
    await safeRedis.setEx(cacheKey, CACHE_TTL, JSON.stringify(enrichedRecipes));
    return enrichedRecipes;
  }

  async getRecommendedRecipes(userId, limit = 10) {
    const favoriteRecords = await prisma.favorite.findMany({
      where: { user_id: userId },
      select: { recipe_id: true },
    });
    const cookHistoryRecords = await prisma.cookHistory.findMany({
      where: { user_id: userId },
      select: { recipe_id: true, status: true },
    });
    const viewedRecords = await prisma.recipeView.findMany({
      where: { viewer_key: `user:${userId}` },
      select: { recipe_id: true },
    });

    const favoriteIds = favoriteRecords.map((record) => record.recipe_id);
    const cookRecipeIds = cookHistoryRecords.map((record) => record.recipe_id);
    const viewedIds = viewedRecords.map((record) => record.recipe_id);
    const excludedRecipeIds = [...new Set([...favoriteIds, ...cookRecipeIds])];

    if (
      favoriteIds.length === 0 &&
      cookRecipeIds.length === 0 &&
      viewedIds.length === 0
    ) {
      return this.getPopularRecipes(limit);
    }

    const interestRecipeIds = [
      ...new Set([...favoriteIds, ...cookRecipeIds, ...viewedIds]),
    ];

    const interestRecipes = await prisma.recipe.findMany({
      where: {
        id: { in: interestRecipeIds },
      },
      include: {
        categories: true,
        cuisines: true,
        ingredients: { include: { ingredient: true } },
      },
    });

    const ingredientScores = {};
    const categoryScores = {};
    const cuisineScores = {};
    const difficultyScores = {};
    const timeScores = {};

    interestRecipes.forEach((recipe) => {
      let weight = 0;
      if (favoriteIds.includes(recipe.id)) weight += 5;
      const cookRecord = cookHistoryRecords.find(
        (item) => item.recipe_id === recipe.id,
      );
      if (cookRecord) {
        if (cookRecord.status === "TO_COOK") weight += 3;
        if (cookRecord.status === "COOKED") weight += 2;
      }
      if (viewedIds.includes(recipe.id)) weight += 1;

      if (weight <= 0) return;

      recipe.categories.forEach((category) => {
        addWeightedCount(categoryScores, category.id, weight);
      });
      recipe.cuisines.forEach((cuisine) => {
        addWeightedCount(cuisineScores, cuisine.id, weight);
      });
      recipe.ingredients.forEach((recipeIngredient) => {
        const ingredientId = recipeIngredient.ingredient?.id;
        addWeightedCount(ingredientScores, ingredientId, weight);
      });
      addWeightedCount(difficultyScores, recipe.difficulty, weight);
      addWeightedCount(
        timeScores,
        getCookingTimeBucket(recipe.cooking_time),
        weight,
      );
    });

    const candidateRecipes = await prisma.recipe.findMany({
      where: {
        status: "PUBLISHED",
        id: { notIn: excludedRecipeIds },
      },
      include: {
        categories: true,
        cuisines: true,
        ingredients: { include: { ingredient: true } },
      },
      orderBy: { popularity_score: "desc" },
      take: 200,
    });

    if (candidateRecipes.length === 0) {
      return this.getPopularRecipes(limit);
    }

    const similarUserSignals = await prisma.favorite.findMany({
      where: {
        recipe_id: { in: favoriteIds },
        user_id: { not: userId },
      },
      select: { user_id: true, recipe_id: true },
    });

    const userSimilarity = {};
    similarUserSignals.forEach((signal) => {
      userSimilarity[signal.user_id] =
        (userSimilarity[signal.user_id] || 0) + 1;
    });

    const topSimilarUserIds = Object.entries(userSimilarity)
      .sort(([, leftScore], [, rightScore]) => rightScore - leftScore)
      .slice(0, 15)
      .map(([userId]) => userId);

    const collaborativeCounts = {};
    if (topSimilarUserIds.length > 0) {
      const similarFavorites = await prisma.favorite.findMany({
        where: {
          user_id: { in: topSimilarUserIds },
          recipe_id: { notIn: excludedRecipeIds },
        },
        select: { recipe_id: true },
      });
      similarFavorites.forEach((favorite) => {
        collaborativeCounts[favorite.recipe_id] =
          (collaborativeCounts[favorite.recipe_id] || 0) + 1;
      });
    }

    const getRecipeContentScore = (recipe) => {
      let score = 0;
      const ingredientScore = recipe.ingredients.reduce(
        (sum, recipeIngredient) => {
          const ingredientId = recipeIngredient.ingredient?.id;
          return sum + (ingredientScores[ingredientId] || 0);
        },
        0,
      );
      score += ingredientScore * 2;

      const categoryScore = recipe.categories.reduce(
        (sum, category) => sum + (categoryScores[category.id] || 0),
        0,
      );
      score += categoryScore * 3;

      const cuisineScore = recipe.cuisines.reduce(
        (sum, cuisine) => sum + (cuisineScores[cuisine.id] || 0),
        0,
      );
      score += cuisineScore * 2;

      score += difficultyScores[recipe.difficulty] ? 4 : 0;
      score += timeScores[getCookingTimeBucket(recipe.cooking_time)] || 0;
      return score;
    };

    const scoredCandidates = candidateRecipes
      .map((recipe) => {
        const contentScore = getRecipeContentScore(recipe);
        const collaborativeScore = collaborativeCounts[recipe.id] || 0;
        const finalScore = contentScore + collaborativeScore * 8;
        return { recipe, finalScore };
      })
      .sort((a, b) => b.finalScore - a.finalScore)
      .slice(0, limit)
      .map(({ recipe }) => recipe);

    return scoredCandidates.length > 0
      ? await enrichRecipesWithUserMetadata(scoredCandidates, userId)
      : await this.getPopularRecipes(limit, userId);
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

  async removeCookStatus(userId, recipeId) {
    try {
      const result = await recipeRepo.removeCookHistory(userId, recipeId);
      await safeRedis.del(`recipe:${recipeId}`);
      return result;
    } catch (err) {
      console.log("Error removing cook status:", err.message);
      throw err;
    }
  }

  async getRecipesByUser(userId, page, limit) {
    const recipes = await recipeRepo.findByUserId(userId, page, limit);
    const total = await recipeRepo.countByUserId(userId);
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
    await this.recalculatePopularity(recipeId);
    await safeRedis.del("popular_recipes");
    await safeRedis.del(`recipe:${recipeId}`);
  }

  async removeFromFavorites(userId, recipeId) {
    await prisma.favorite.deleteMany({
      where: { user_id: userId, recipe_id: parseInt(recipeId) },
    });

    await this.recalculatePopularity(recipeId);
    await safeRedis.del("popular_recipes");
    await safeRedis.del(`recipe:${recipeId}`);
  }

  async registerRecipeView(recipeId, viewerKey) {
    const id = parseInt(recipeId);
    if (!viewerKey) {
      throw new Error("Viewer key is required");
    }

    const recipe = await prisma.recipe.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!recipe) {
      throw new Error("Recipe not found");
    }

    const existingView = await prisma.recipeView.findUnique({
      where: { recipe_id_viewer_key: { recipe_id: id, viewer_key: viewerKey } },
    });

    const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);
    const shouldCountView =
      !existingView || existingView.last_viewed_at < twelveHoursAgo;

    if (!shouldCountView) {
      return { counted: false };
    }

    await prisma.$transaction([
      existingView
        ? prisma.recipeView.update({
            where: {
              recipe_id_viewer_key: {
                recipe_id: id,
                viewer_key: viewerKey,
              },
            },
            data: { last_viewed_at: new Date() },
          })
        : prisma.recipeView.create({
            data: {
              recipe: { connect: { id } },
              viewer_key: viewerKey,
            },
          }),
      prisma.recipe.update({
        where: { id },
        data: { views: { increment: 1 } },
      }),
    ]);

    await this.recalculatePopularity(recipeId);
    await safeRedis.del("popular_recipes");
    await safeRedis.del(`recipe:${recipeId}`);
    return { counted: true };
  }

  async recalculatePopularity(recipeId) {
    const id = parseInt(recipeId);
    const recipe = await prisma.recipe.findUnique({
      where: { id },
      select: { views: true, created_at: true },
    });
    if (!recipe) {
      return null;
    }

    const commentsCount = await prisma.comment.count({
      where: { recipe_id: id, is_hidden: false },
    });

    const favoritesCount = await prisma.favorite.count({
      where: { recipe_id: id },
    });

    const popularity_score = calculatePopularityScore({
      favorites: favoritesCount,
      comments: commentsCount,
      views: recipe.views,
      created_at: recipe.created_at,
    });

    return prisma.recipe.update({
      where: { id },
      data: { popularity_score },
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

  async searchByIngredients(
    ingredientIds,
    page = 1,
    limit = 10,
    userId = null,
  ) {
    const cacheKey = `recipes:ingredients:${ingredientIds.sort().join(",")}:${page}:${limit}:${userId || "anon"}`;
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
    const enrichedRecipes = await enrichRecipesWithUserMetadata(
      recipes,
      userId,
    );

    const result = { recipes: enrichedRecipes, total, page, limit };
    await safeRedis.setEx(cacheKey, CACHE_TTL, JSON.stringify(result));
    return result;
  }
}
