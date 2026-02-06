import { jest } from "@jest/globals";
import { IngredientService } from "../services/ingredientService.js";
import { IngredientRepository } from "../repositories/ingredientRepository.js";

// Mock dependencies
jest.mock("../repositories/ingredientRepository.js");

describe("IngredientService", () => {
  let ingredientService;
  let mockIngredientRepo;

  beforeEach(() => {
    mockIngredientRepo = new IngredientRepository();
    ingredientService = new IngredientService();
    jest.clearAllMocks();
  });

  describe("createIngredient", () => {
    it("should create ingredient successfully", async () => {
      const ingredientData = { name: "Tomato", unit: "kg" };
      const createdIngredient = { id: "1", ...ingredientData };
      mockIngredientRepo.create.mockResolvedValue(createdIngredient);

      const result = await ingredientService.createIngredient(ingredientData);

      expect(mockIngredientRepo.create).toHaveBeenCalledWith(ingredientData);
      expect(result).toBe(createdIngredient);
    });
  });

  describe("getIngredientById", () => {
    it("should return ingredient by id", async () => {
      const ingredient = { id: "1", name: "Tomato" };
      mockIngredientRepo.findById.mockResolvedValue(ingredient);

      const result = await ingredientService.getIngredientById("1");

      expect(mockIngredientRepo.findById).toHaveBeenCalledWith("1");
      expect(result).toBe(ingredient);
    });

    it("should throw error if ingredient not found", async () => {
      mockIngredientRepo.findById.mockResolvedValue(null);

      await expect(ingredientService.getIngredientById("1")).rejects.toThrow(
        "Ingredient not found",
      );
    });
  });

  describe("updateIngredient", () => {
    it("should update ingredient successfully", async () => {
      const ingredientId = "1";
      const updateData = { name: "Cherry Tomato" };
      const updatedIngredient = { id: ingredientId, name: "Cherry Tomato" };
      mockIngredientRepo.update.mockResolvedValue(updatedIngredient);

      const result = await ingredientService.updateIngredient(
        ingredientId,
        updateData,
      );

      expect(mockIngredientRepo.update).toHaveBeenCalledWith(
        ingredientId,
        updateData,
      );
      expect(result).toBe(updatedIngredient);
    });
  });

  describe("deleteIngredient", () => {
    it("should delete ingredient successfully", async () => {
      mockIngredientRepo.delete.mockResolvedValue({ id: "1" });

      const result = await ingredientService.deleteIngredient("1");

      expect(mockIngredientRepo.delete).toHaveBeenCalledWith("1");
      expect(result).toHaveProperty("id", "1");
    });
  });

  describe("getAllIngredients", () => {
    it("should return paginated ingredients", async () => {
      const ingredients = [{ id: "1", name: "Tomato" }];
      mockIngredientRepo.findAll.mockResolvedValue(ingredients);

      const result = await ingredientService.getAllIngredients(1, 10);

      expect(mockIngredientRepo.findAll).toHaveBeenCalledWith(1, 10);
      expect(result).toBe(ingredients);
    });
  });

  describe("searchIngredients", () => {
    it("should search ingredients by query", async () => {
      const ingredients = [{ id: "1", name: "Tomato" }];
      mockIngredientRepo.search.mockResolvedValue(ingredients);

      const result = await ingredientService.searchIngredients("tomato", 1, 10);

      expect(mockIngredientRepo.search).toHaveBeenCalledWith("tomato", 1, 10);
      expect(result).toBe(ingredients);
    });
  });
});
