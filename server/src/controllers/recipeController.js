import { RecipeService } from "../services/recipeService.js";
import { processImage } from "../middleware/upload.js";

const recipeService = new RecipeService();

export const getRecipe = async (req, res) => {
  try {
    const recipe = await recipeService.getRecipeById(req.params.id);
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
    const filters = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await recipeService.getRecipes(filters, page, limit);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createRecipe = async (req, res) => {
  try {
    let recipeData = { ...req.body, author_id: req.user.id };

    // Process preview image
    if (req.file) {
      const filename = `recipe_${Date.now()}.jpg`;
      recipeData.preview_img_url = await processImage(
        req.file.buffer,
        filename,
      );
      // Generate thumbnail
      const thumbnailFilename = `recipe_thumb_${Date.now()}.jpg`;
      recipeData.thumbnail = await processImage(
        req.file.buffer,
        thumbnailFilename,
        300,
        300,
      );
    }

    // Parse nested data
    if (recipeData.ingredients) {
      recipeData.ingredient = JSON.parse(recipeData.ingredients);
    }
    if (recipeData.steps) {
      recipeData.steps = JSON.parse(recipeData.steps);
    }
    if (recipeData.categories) {
      recipeData.categories = {
        connect: JSON.parse(recipeData.categories).map((id) => ({
          id: parseInt(id),
        })),
      };
    }
    if (recipeData.tags) {
      recipeData.tags = {
        connect: JSON.parse(recipeData.tags).map((id) => ({
          id: parseInt(id),
        })),
      };
    }
    if (recipeData.cuisines) {
      recipeData.cuisines = {
        connect: JSON.parse(recipeData.cuisines).map((id) => ({
          id: parseInt(id),
        })),
      };
    }

    const recipe = await recipeService.createRecipe(recipeData);
    res.status(201).json(recipe);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateRecipe = async (req, res) => {
  try {
    const recipe = await recipeService.updateRecipe(req.params.id, req.body);
    res.json(recipe);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteRecipe = async (req, res) => {
  try {
    await recipeService.deleteRecipe(req.params.id);
    res.json({ message: "Recipe deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//!!!!! надо переделать бд для вычисления популярности
export const getPopularRecipes = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const recipes = await recipeService.getPopularRecipes(limit);
    res.json(recipes);
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

export const markAsCooked = async (req, res) => {
  try {
    await recipeService.markAsCooked(req.user.id, req.params.id);
    res.json({ message: "Marked as cooked" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getRecipeById = async (req, res) => {
  try {
    const recipe = await recipeService.getRecipeById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }
    res.json(recipe);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllRecipes = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await recipeService.getAllRecipes(page, limit);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

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

export const getRecipeRating = async (req, res) => {
  try {
    const rating = await recipeService.getRecipeRating(req.params.id);
    res.json(rating);
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
