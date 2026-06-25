import { jest } from "@jest/globals";
import prisma from "../config/database.js";
import { RecipeService } from "../services/recipeService.js";
import { RecipeRepository } from "../repositories/recipeRepository.js";

// Mock dependencies
jest.mock("../repositories/recipeRepository.js");

describe("RecipeService", () => {
  let recipeService;
  let mockRecipeRepo;

  beforeEach(() => {
    mockRecipeRepo = new RecipeRepository();
    recipeService = new RecipeService();
    jest.clearAllMocks();
  });

  describe("createRecipe", () => {
    it("should create recipe successfully", async () => {
      const recipeData = {
        title: "Test Recipe",
        description: "Test Description",
        user_id: "1",
      };
      const createdRecipe = { id: "1", ...recipeData };
      mockRecipeRepo.create.mockResolvedValue(createdRecipe);

      const result = await recipeService.createRecipe(recipeData);

      expect(mockRecipeRepo.create).toHaveBeenCalledWith(recipeData);
      expect(result).toBe(createdRecipe);
    });
  });

  describe("getRecipeById", () => {
    it("should return recipe by id", async () => {
      const recipe = { id: "1", title: "Test Recipe" };
      mockRecipeRepo.findById.mockResolvedValue(recipe);

      const result = await recipeService.getRecipeById("1");

      expect(mockRecipeRepo.findById).toHaveBeenCalledWith("1");
      expect(result).toBe(recipe);
    });

    it("should throw error if recipe not found", async () => {
      mockRecipeRepo.findById.mockResolvedValue(null);

      await expect(recipeService.getRecipeById("1")).rejects.toThrow(
        "Recipe not found",
      );
    });
  });

  describe("updateRecipe", () => {
    it("should update recipe successfully", async () => {
      const recipeId = "1";
      const updateData = { title: "Updated Title" };
      const updatedRecipe = { id: recipeId, title: "Updated Title" };
      mockRecipeRepo.update.mockResolvedValue(updatedRecipe);

      const result = await recipeService.updateRecipe(recipeId, updateData);

      expect(mockRecipeRepo.update).toHaveBeenCalledWith(recipeId, updateData);
      expect(result).toBe(updatedRecipe);
    });

    it("should verify newly added ingredient when admin updates recipe", async () => {
      const recipeId = "1";
      const adminUser = { role: "ADMIN" };
      const existingRecipe = { id: recipeId };
      const ingredientEntry = {
        ingredient_name: "Tomato",
        amount: 100,
        unit: "g",
      };
      const ingredientId = 10;
      const existingIngredient = {
        id: ingredientId,
        name: "Tomato",
        status: "NotVerified",
      };
      const updatedRecipe = { id: recipeId, title: "Updated", ingredients: [] };

      mockRecipeRepo.findById.mockResolvedValue(existingRecipe);
      prisma.ingredient.findFirst.mockResolvedValue(existingIngredient);
      prisma.ingredient.updateMany.mockResolvedValue({ count: 1 });
      mockRecipeRepo.update.mockResolvedValue(updatedRecipe);

      const result = await recipeService.updateRecipe(
        recipeId,
        { ingredients: [ingredientEntry] },
        adminUser,
      );

      expect(prisma.ingredient.findFirst).toHaveBeenCalledWith({
        where: {
          name: {
            equals: ingredientEntry.ingredient_name,
            mode: "insensitive",
          },
        },
      });
      expect(prisma.ingredient.updateMany).toHaveBeenCalledWith({
        where: { id: ingredientId, status: "NotVerified" },
        data: { status: "Verified" },
      });
      expect(mockRecipeRepo.update).toHaveBeenCalledWith(recipeId, {
        ingredients: {
          deleteMany: {},
          create: [
            {
              ingredient: { connect: { id: ingredientId } },
              amount: Number(ingredientEntry.amount),
              unit: ingredientEntry.unit,
            },
          ],
        },
      });
      expect(result).toBe(updatedRecipe);
    });
  });

  describe("deleteRecipe", () => {
    it("should delete recipe successfully", async () => {
      mockRecipeRepo.delete.mockResolvedValue({ id: "1" });

      const result = await recipeService.deleteRecipe("1");

      expect(mockRecipeRepo.delete).toHaveBeenCalledWith("1");
      expect(result).toHaveProperty("id", "1");
    });
  });

  describe("getAllRecipes", () => {
    it("should return paginated recipes", async () => {
      const recipes = [{ id: "1", title: "Test Recipe" }];
      mockRecipeRepo.findAll.mockResolvedValue(recipes);

      const result = await recipeService.getAllRecipes(1, 10);

      expect(mockRecipeRepo.findAll).toHaveBeenCalledWith(1, 10);
      expect(result).toBe(recipes);
    });
  });

  describe("getRecipesByUser", () => {
    it("should return recipes by user with total count", async () => {
      const recipes = [{ id: "1", title: "User Recipe" }];
      mockRecipeRepo.findByUserId.mockResolvedValue(recipes);
      mockRecipeRepo.countByUserId.mockResolvedValue(3);

      const result = await recipeService.getRecipesByUser("1", 1, 10);

      expect(mockRecipeRepo.findByUserId).toHaveBeenCalledWith("1", 1, 10);
      expect(mockRecipeRepo.countByUserId).toHaveBeenCalledWith("1");
      expect(result).toEqual({ recipes, total: 3, page: 1, limit: 10 });
    });
  });

  describe("searchRecipes", () => {
    it("should search recipes by query", async () => {
      const recipes = [{ id: "1", title: "Pasta Recipe" }];
      mockRecipeRepo.search.mockResolvedValue(recipes);

      const result = await recipeService.searchRecipes("pasta", 1, 10);

      expect(mockRecipeRepo.search).toHaveBeenCalledWith("pasta", 1, 10);
      expect(result).toBe(recipes);
    });
  });

  describe("getRecipesByCategory", () => {
    it("should return recipes by category", async () => {
      const recipes = [{ id: "1", title: "Italian Recipe" }];
      mockRecipeRepo.findByCategory.mockResolvedValue(recipes);

      const result = await recipeService.getRecipesByCategory("1", 1, 10);

      expect(mockRecipeRepo.findByCategory).toHaveBeenCalledWith("1", 1, 10);
      expect(result).toBe(recipes);
    });
  });

  describe("getRecipesByCuisine", () => {
    it("should return recipes by cuisine", async () => {
      const recipes = [{ id: "1", title: "Italian Recipe" }];
      mockRecipeRepo.findByCuisine.mockResolvedValue(recipes);

      const result = await recipeService.getRecipesByCuisine("1", 1, 10);

      expect(mockRecipeRepo.findByCuisine).toHaveBeenCalledWith("1", 1, 10);
      expect(result).toBe(recipes);
    });
  });

  describe("getRecipesByTag", () => {
    it("should return recipes by tag", async () => {
      const recipes = [{ id: "1", title: "Vegan Recipe" }];
      mockRecipeRepo.findByTag.mockResolvedValue(recipes);

      const result = await recipeService.getRecipesByTag("1", 1, 10);

      expect(mockRecipeRepo.findByTag).toHaveBeenCalledWith("1", 1, 10);
      expect(result).toBe(recipes);
    });
  });

  describe("addToFavorites", () => {
    it("should add recipe to favorites", async () => {
      mockRecipeRepo.addToFavorites.mockResolvedValue({
        user_id: "1",
        recipe_id: "1",
      });

      const result = await recipeService.addToFavorites("1", "1");

      expect(mockRecipeRepo.addToFavorites).toHaveBeenCalledWith("1", "1");
      expect(result).toHaveProperty("user_id", "1");
    });
  });

  describe("removeFromFavorites", () => {
    it("should remove recipe from favorites", async () => {
      mockRecipeRepo.removeFromFavorites.mockResolvedValue({
        user_id: "1",
        recipe_id: "1",
      });

      const result = await recipeService.removeFromFavorites("1", "1");

      expect(mockRecipeRepo.removeFromFavorites).toHaveBeenCalledWith("1", "1");
      expect(result).toHaveProperty("user_id", "1");
    });
  });

  describe("getFavoriteRecipes", () => {
    it("should return favorite recipes", async () => {
      const recipes = [{ id: "1", title: "Favorite Recipe" }];
      mockRecipeRepo.getFavorites.mockResolvedValue(recipes);

      const result = await recipeService.getFavoriteRecipes("1", 1, 10);

      expect(mockRecipeRepo.getFavorites).toHaveBeenCalledWith("1", 1, 10);
      expect(result).toBe(recipes);
    });
  });

  describe("addCookHistory", () => {
    it("should add to cook history", async () => {
      mockRecipeRepo.addCookHistory.mockResolvedValue({
        user_id: "1",
        recipe_id: "1",
      });

      const result = await recipeService.addCookHistory("1", "1");

      expect(mockRecipeRepo.addCookHistory).toHaveBeenCalledWith("1", "1");
      expect(result).toHaveProperty("user_id", "1");
    });
  });

  describe("getCookHistory", () => {
    it("should return cook history", async () => {
      const history = [{ recipe_id: "1", cooked_at: new Date() }];
      mockRecipeRepo.getCookHistory.mockResolvedValue(history);

      const result = await recipeService.getCookHistory("1", 1, 10);

      expect(mockRecipeRepo.getCookHistory).toHaveBeenCalledWith("1", 1, 10);
      expect(result).toBe(history);
    });
  });
});
