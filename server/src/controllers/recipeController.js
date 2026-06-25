import { RecipeService } from "../services/recipeService.js";
import { processImage } from "../middleware/upload.js";
import crypto from "crypto";

const recipeService = new RecipeService();

export const getRecipe = async (req, res) => {
  try {
    const user = req.query;
    const recipe = await recipeService.getRecipeById(
      req.params.id,
      user.userId,
    );
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }
    res.json(recipe);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getRecipes = async (req, res) => {
  try {
    const { page, limit, ...filters } = req.query;
    const userId = req.query.userId || req?.user?.id || null;
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const result = await recipeService.getRecipes(
      filters,
      pageNum,
      limitNum,
      userId,
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyRecipes = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const result = await recipeService.getRecipesByUser(
      req.user.id,
      page,
      limit,
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createRecipe = async (req, res) => {
  try {
    const recipeData = { ...req.body, author_id: req.user.id };

    if (req.file) {
      const filename = `recipe_${Date.now()}.jpg`;
      recipeData.preview_img_url = await processImage(
        req.file.buffer,
        filename,
      );
      const thumbnailFilename = `recipe_thumb_${Date.now()}.jpg`;
      recipeData.thumbnail = await processImage(
        req.file.buffer,
        thumbnailFilename,
        300,
        300,
      );
    }

    if (recipeData.steps) {
      const stepsParsed = JSON.parse(recipeData.steps);

      recipeData.steps = {
        create: stepsParsed.map((s) => ({
          description: s.description,
          step_number: Number(s.step_number),
        })),
      };
    }

    const parseRelationValues = (value) => {
      if (value === undefined || value === null) return undefined;
      if (typeof value === "string") {
        try {
          return JSON.parse(value);
        } catch {
          return undefined;
        }
      }
      return value;
    };

    const normalizeConnect = (value) => {
      const ids = parseRelationValues(value);
      if (!Array.isArray(ids)) return undefined;
      return ids
        .map((id) => Number(id))
        .filter((id) => !Number.isNaN(id))
        .map((id) => ({ id }));
    };

    if (recipeData.categories) {
      const categories = normalizeConnect(recipeData.categories);
      if (categories) {
        recipeData.categories = { connect: categories };
      }
    }
    if (recipeData.tags) {
      const tags = normalizeConnect(recipeData.tags);
      if (tags) {
        recipeData.tags = { connect: tags };
      }
    }
    if (recipeData.cuisines) {
      const cuisines = normalizeConnect(recipeData.cuisines);
      if (cuisines) {
        recipeData.cuisines = { connect: cuisines };
      }
    }

    const recipe = await recipeService.createRecipe(recipeData);
    res.status(201).json(recipe);
  } catch (error) {
    res.status(500).json({ message: "Не удалось создать рецепт!" });
  }
};

export const updateRecipe = async (req, res) => {
  try {
    const recipeData = { ...req.body };

    if (req.file) {
      const filename = `recipe_${Date.now()}.jpg`;
      recipeData.preview_img_url = await processImage(
        req.file.buffer,
        filename,
      );
      const thumbnailFilename = `recipe_thumb_${Date.now()}.jpg`;
      recipeData.thumbnail = await processImage(
        req.file.buffer,
        thumbnailFilename,
        300,
        300,
      );
    }

    if (recipeData.steps) {
      const stepsParsed = JSON.parse(recipeData.steps);

      recipeData.steps = {
        create: stepsParsed.map((s) => ({
          description: s.description,
          step_number: Number(s.step_number),
        })),
      };
    }

    if (recipeData.categories) {
      recipeData.categories = JSON.parse(recipeData.categories).map((id) =>
        parseInt(id),
      );
    }
    if (recipeData.tags) {
      recipeData.tags = JSON.parse(recipeData.tags).map((id) => parseInt(id));
    }
    if (recipeData.cuisines) {
      recipeData.cuisines = JSON.parse(recipeData.cuisines).map((id) =>
        parseInt(id),
      );
    }

    const recipe = await recipeService.updateRecipe(
      req.params.id,
      recipeData,
      req.user,
    );
    res.json(recipe);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteRecipe = async (req, res) => {
  try {
    const recipe = await recipeService.getRecipeById(req.params.id);
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });

    // allow admin or author
    if (req.user.role !== "ADMIN" && recipe.author_id !== req.user.id) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    await recipeService.deleteRecipe(req.params.id);
    res.json({ message: "Recipe deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//!!!!! надо переделать бд для вычисления популярности
export const getPopularRecipes = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const recipes = await recipeService.getPopularRecipes(limit, req.user?.id);
    res.json(recipes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getRecommendedRecipes = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;
    const recipes = await recipeService.getRecommendedRecipes(
      req.user.id,
      limit,
    );
    res.json({ recipes, total: recipes.length, page: 1, limit });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const registerRecipeView = async (req, res) => {
  try {
    const viewerCookie = req.cookies?.cooking_time_viewer_id;
    const viewerKey = req.user
      ? `user:${req.user.id}`
      : viewerCookie || `guest:${crypto.randomUUID()}`;

    const result = await recipeService.registerRecipeView(
      req.params.id,
      viewerKey,
    );

    if (!viewerCookie && !req.user) {
      res.cookie("cooking_time_viewer_id", viewerKey.replace(/^guest:/, ""), {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 365,
        sameSite: "lax",
      });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// export const addToFavorites = async (req, res) => {
//   try {
//     await recipeService.addToFavorites(req.user.id, req.params.id);
//     res.json({ message: "Added to favorites" });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// export const removeFromFavorites = async (req, res) => {
//   try {
//     await recipeService.removeFromFavorites(req.user.id, req.params.id);
//     res.json({ message: "Removed from favorites" });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

export const approveRecipe = async (req, res) => {
  try {
    await recipeService.approveRecipe(req.params.id);
    res.json({ message: "Recipe approved" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const rejectRecipe = async (req, res) => {
  try {
    const reason = req.body.reason || "Причина не указана";
    await recipeService.rejectRecipe(req.params.id, reason);
    res.json({ message: "Recipe rejected" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPendingRecipes = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const result = await recipeService.getPendingRecipes(page, limit);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getRecipeWithDraft = async (req, res) => {
  try {
    const recipe = await recipeService.getRecipeWithDraftById(req.params.id);
    res.json(recipe);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const markRecipeStatus = async (req, res) => {
  try {
    const status = req.body.status || "COOKED";
    await recipeService.markRecipeStatus(req.user.id, req.params.id, status);
    res.json({ message: "Marked as cooked" });
  } catch (error) {
    if (error.message === "RECIPE_ALREADY_MARKED_AS_COOKED") {
      return res.status(409).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};
//   try {
//     const recipe = await recipeService.getRecipeById(req.params.id);
//     if (!recipe) {
//       return res.status(404).json({ message: "Recipe not found" });
//     }
//     res.json(recipe);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// export const getAllRecipes = async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 10;
//     const result = await recipeService.getAllRecipes(page, limit);
//     res.json(result);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

export const searchRecipes = async (req, res) => {
  try {
    const query = req.query.q;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await recipeService.searchRecipes(query, page, limit);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getRecipesByUser = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await recipeService.getRecipesByUser(
      req.params.userId,
      page,
      limit,
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getRecipesByCategory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await recipeService.getRecipesByCategory(
      req.params.categoryId,
      page,
      limit,
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getRecipesByTag = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await recipeService.getRecipesByTag(
      req.params.tagId,
      page,
      limit,
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getRecipesByCuisine = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await recipeService.getRecipesByCuisine(
      req.params.cuisineId,
      page,
      limit,
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addToFavorites = async (req, res) => {
  try {
    await recipeService.addToFavorites(req.user.id, req.params.id);
    res.json({ message: "Recipe added to favorites" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const removeFromFavorites = async (req, res) => {
  try {
    await recipeService.removeFromFavorites(req.user.id, req.params.id);
    res.json({ message: "Recipe removed from favorites" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getFavoriteRecipes = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await recipeService.getFavoriteRecipes(
      req.user.id,
      page,
      limit,
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const rateRecipe = async (req, res) => {
  try {
    const { rating } = req.body;
    await recipeService.rateRecipe(req.params.id, req.user.id, rating);
    res.json({ message: "Recipe rated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCookHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await recipeService.getCookHistory(req.user.id, page, limit);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addToCookHistory = async (req, res) => {
  try {
    await recipeService.addCookHistory(req.user.id, req.params.id);
    res.json({ message: "Added to cook history" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const removeCookStatus = async (req, res) => {
  try {
    await recipeService.removeCookStatus(req.user.id, req.params.id);
    res.json({ message: "Cook status removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const smartSearch = async (req, res) => {
  try {
    const { ingredientIds } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    if (!ingredientIds) {
      return res
        .status(400)
        .json({ message: "ingredientIds query parameter is required" });
    }

    // Parse ingredientIds (can be comma-separated string or array)
    let ids = [];
    if (typeof ingredientIds === "string") {
      ids = ingredientIds
        .split(",")
        .map((id) => parseInt(id))
        .filter((id) => !isNaN(id));
    } else if (Array.isArray(ingredientIds)) {
      ids = ingredientIds.map((id) => parseInt(id)).filter((id) => !isNaN(id));
    }

    if (ids.length === 0) {
      return res
        .status(400)
        .json({ message: "At least one valid ingredientId is required" });
    }

    const result = await recipeService.searchByIngredients(
      ids,
      page,
      limit,
      req.user?.id,
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
