import prisma from "../config/database.js";

export class RecipeRepository {
  async findById(id) {
    try {
      return prisma.recipe.findUnique({
        where: { id: parseInt(id) },
        include: {
          author: true,
          ingredients: { include: { ingredient: true } },
          steps: true,
          categories: true,
          tags: true,
          cuisines: true,
          comments: { include: { user: true } },
        },
      });
    } catch (err) {
      console.log(err.message);
    }
  }

  async findByIdWithIngredients(id) {
    console.log("id: ", id);
    return prisma.recipe.findUnique({
      where: { id: parseInt(id) },
      include: {
        ingredients: { include: { ingredient: true } },
      },
    });
  }

  async findAll(filters = {}, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const where = {};

    // Search filter
    if (filters.search)
      where.title = { contains: filters.search, mode: "insensitive" };

    // Status filter
    if (filters.status) where.status = filters.status;
    if (!filters.status) where.status = "PUBLISHED";

    // Author filter
    if (filters.author_id) where.author_id = filters.author_id;

    // Favorite filter
    if (filters.isFavorite) {
      where.favorite = {
        some: {
          user_id: filters.userId,
        },
      };
    }

    // Category filter - parse comma-separated string to array of IDs
    if (filters.categories) {
      const categoryIds =
        typeof filters.categories === "string"
          ? filters.categories
              .split(",")
              .map((id) => parseInt(id))
              .filter((id) => !isNaN(id))
          : Array.isArray(filters.categories)
            ? filters.categories
            : [];

      if (categoryIds.length > 0) {
        where.categories = {
          some: {
            id: { in: categoryIds },
          },
        };
      }
    }

    // Tag filter - parse comma-separated string to array of IDs
    if (filters.tags) {
      const tagIds =
        typeof filters.tags === "string"
          ? filters.tags
              .split(",")
              .map((id) => parseInt(id))
              .filter((id) => !isNaN(id))
          : Array.isArray(filters.tags)
            ? filters.tags
            : [];

      if (tagIds.length > 0) {
        where.tags = {
          some: {
            id: { in: tagIds },
          },
        };
      }
    }

    // Cuisine filter - parse comma-separated string to array of IDs
    if (filters.cuisines) {
      const cuisineIds =
        typeof filters.cuisines === "string"
          ? filters.cuisines
              .split(",")
              .map((id) => parseInt(id))
              .filter((id) => !isNaN(id))
          : Array.isArray(filters.cuisines)
            ? filters.cuisines
            : [];

      if (cuisineIds.length > 0) {
        where.cuisines = {
          some: {
            id: { in: cuisineIds },
          },
        };
      }
    }

    // Difficulty filter
    if (filters.difficulty) where.difficulty = filters.difficulty;

    // Calories range filter
    if (filters.caloriesMin !== undefined && filters.caloriesMin !== null) {
      where.calories = { gte: parseInt(filters.caloriesMin) };
    }
    if (filters.caloriesMax !== undefined && filters.caloriesMax !== null) {
      if (where.calories) {
        where.calories.lte = parseInt(filters.caloriesMax);
      } else {
        where.calories = { lte: parseInt(filters.caloriesMax) };
      }
    }

    // Cooking time range filter
    if (
      filters.cookingTimeMin !== undefined &&
      filters.cookingTimeMin !== null
    ) {
      where.cooking_time = { gte: parseInt(filters.cookingTimeMin) };
    }
    if (
      filters.cookingTimeMax !== undefined &&
      filters.cookingTimeMax !== null
    ) {
      if (where.cooking_time) {
        where.cooking_time.lte = parseInt(filters.cookingTimeMax);
      } else {
        where.cooking_time = { lte: parseInt(filters.cookingTimeMax) };
      }
    }

    return prisma.recipe.findMany({
      where,
      skip,
      take: limit,
      include: {
        author: true,
        categories: true,
        tags: true,
        cuisines: true,
        ingredients: {
          include: {
            ingredient: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
    });
  }

  async create(recipeData) {
    return prisma.recipe.create({
      data: {
        ...recipeData,
        cooking_time: Number(recipeData.cooking_time),
        calories: Number(recipeData.calories),
      },
    });
  }

  async update(id, data) {
    console.log("update data: ", data.steps);
    return prisma.recipe.update({
      where: { id: parseInt(id) },
      data,
    });
  }

  async delete(id) {
    return prisma.recipe.delete({
      where: { id: parseInt(id) },
    });
  }

  async count(filters = {}) {
    const where = {};

    // Search filter
    if (filters.search)
      where.title = { contains: filters.search, mode: "insensitive" };

    // Status filter
    if (filters.status) where.status = filters.status;
    if (!filters.status) where.status = "PUBLISHED";

    // Author filter
    if (filters.author_id) where.author_id = filters.author_id;

    // Category filter - parse comma-separated string to array of IDs
    if (filters.categories) {
      const categoryIds =
        typeof filters.categories === "string"
          ? filters.categories
              .split(",")
              .map((id) => parseInt(id))
              .filter((id) => !isNaN(id))
          : Array.isArray(filters.categories)
            ? filters.categories
            : [];

      if (categoryIds.length > 0) {
        where.categories = {
          some: {
            id: { in: categoryIds },
          },
        };
      }
    }

    // Tag filter - parse comma-separated string to array of IDs
    if (filters.tags) {
      const tagIds =
        typeof filters.tags === "string"
          ? filters.tags
              .split(",")
              .map((id) => parseInt(id))
              .filter((id) => !isNaN(id))
          : Array.isArray(filters.tags)
            ? filters.tags
            : [];

      if (tagIds.length > 0) {
        where.tags = {
          some: {
            id: { in: tagIds },
          },
        };
      }
    }

    // Cuisine filter - parse comma-separated string to array of IDs
    if (filters.cuisines) {
      const cuisineIds =
        typeof filters.cuisines === "string"
          ? filters.cuisines
              .split(",")
              .map((id) => parseInt(id))
              .filter((id) => !isNaN(id))
          : Array.isArray(filters.cuisines)
            ? filters.cuisines
            : [];

      if (cuisineIds.length > 0) {
        where.cuisines = {
          some: {
            id: { in: cuisineIds },
          },
        };
      }
    }

    // Difficulty filter
    if (filters.difficulty) where.difficulty = filters.difficulty;

    // Calories range filter
    if (filters.caloriesMin !== undefined && filters.caloriesMin !== null) {
      where.calories = { gte: parseInt(filters.caloriesMin) };
    }
    if (filters.caloriesMax !== undefined && filters.caloriesMax !== null) {
      if (where.calories) {
        where.calories.lte = parseInt(filters.caloriesMax);
      } else {
        where.calories = { lte: parseInt(filters.caloriesMax) };
      }
    }

    // Cooking time range filter
    if (
      filters.cookingTimeMin !== undefined &&
      filters.cookingTimeMin !== null
    ) {
      where.cooking_time = { gte: parseInt(filters.cookingTimeMin) };
    }
    if (
      filters.cookingTimeMax !== undefined &&
      filters.cookingTimeMax !== null
    ) {
      if (where.cooking_time) {
        where.cooking_time.lte = parseInt(filters.cookingTimeMax);
      } else {
        where.cooking_time = { lte: parseInt(filters.cookingTimeMax) };
      }
    }

    return prisma.recipe.count({ where });
  }

  async getPopular(limit = 10) {
    return prisma.recipe.findMany({
      where: { status: "PUBLISHED" },
      take: limit,
      include: {
        author: true,
        categories: true,
        tags: true,
        cuisines: true,
      },
      orderBy: { popularity_score: "desc" },
    });
  }

  async findByUserId(userId, page = 1, limit = 10) {
    console.log(userId);
    const skip = (page - 1) * limit;
    return prisma.recipe.findMany({
      where: { author_id: userId },
      skip,
      take: limit,
      include: {
        author: true,
        categories: true,
        tags: true,
        cuisines: true,
      },
      orderBy: { created_at: "desc" },
    });
  }

  // async markAsCooked(userId, recipeId) {
  //   console.log("Marked as cooked");
  //   return prisma.cookHistory.create({
  //     data: {
  //       user_id: userId,
  //       recipe_id: parseInt(recipeId),
  //       status: "COOKED",
  //     },
  //   });
  // }

  // async markAsToCook(userId, recipeId) {
  //   return prisma.cookHistory.create({
  //     data: {
  //       user_id: userId,
  //       recipe_id: parseInt(recipeId),
  //       status: "TO_COOK",
  //     },
  //   });
  // }

  async getCookMark(userId, recipeId) {
    const record = await prisma.cookHistory.findFirst({
      where: {
        user_id: userId,
        recipe_id: parseInt(recipeId),
      },
    });
    return record ? record.status : undefined;
  }

  async markRecipeStatus(userId, recipeId, status) {
    return prisma.cookHistory.upsert({
      where: {
        user_id_recipe_id: {
          user_id: userId,
          recipe_id: parseInt(recipeId),
        },
      },
      update: {
        status,
      },
      create: {
        user_id: userId,
        recipe_id: parseInt(recipeId),
        status,
      },
    });
  }

  /**
   * Find recipes by ingredients with smart matching
   * Returns recipes that have at least one of the provided ingredients,
   * sorted by percentage of available ingredients (highest first)
   * @param {number[]} ingredientIds - Array of ingredient IDs to search for
   * @param {number} page - Page number for pagination
   * @param {number} limit - Number of results per page
   * @returns {Promise<Array>} Array of recipes with matchPercentage property
   */
  async findByIngredients(ingredientIds, page = 1, limit = 10) {
    const ids = ingredientIds
      .map((id) => parseInt(id))
      .filter((id) => !Number.isNaN(id));

    if (ids.length === 0) {
      return [];
    }

    // Find all recipes that have at least one of the provided ingredients,
    // then sort them by match percentage and apply pagination in memory.
    const recipes = await prisma.recipe.findMany({
      where: {
        ingredients: {
          some: {
            ingredient_id: { in: ids },
          },
        },
        status: "PUBLISHED",
      },
      include: {
        author: true,
        categories: true,
        tags: true,
        cuisines: true,
        ingredients: {
          include: { ingredient: true },
        },
      },
    });

    const recipesWithMatch = recipes
      .map((recipe) => {
        const totalIngredients = recipe.ingredients.length;
        const matchedIngredients = recipe.ingredients.filter((ri) =>
          ids.includes(ri.ingredient_id),
        ).length;

        const matchPercentage = totalIngredients
          ? (matchedIngredients / totalIngredients) * 100
          : 0;

        return {
          ...recipe,
          matchPercentage: Math.round(matchPercentage),
          missingPercentage: Math.round(100 - matchPercentage),
          availableIngredientsCount: matchedIngredients,
          totalIngredientsCount: totalIngredients,
        };
      })
      .sort((a, b) => b.matchPercentage - a.matchPercentage);

    const start = (page - 1) * limit;
    return recipesWithMatch.slice(start, start + limit);
  }

  /**
   * Count recipes that match by ingredients
   */
  async countByIngredients(ingredientIds) {
    const ids = ingredientIds.map((id) => parseInt(id));

    return prisma.recipe.count({
      where: {
        ingredients: {
          some: {
            ingredient_id: { in: ids },
          },
        },
        status: "PUBLISHED",
      },
    });
  }
}
