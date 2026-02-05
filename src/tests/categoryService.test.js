import { jest } from "@jest/globals";
import { CategoryService } from "../services/categoryService.js";
import { CategoryRepository } from "../repositories/categoryRepository.js";

// Mock dependencies
jest.mock("../repositories/categoryRepository.js");

describe("CategoryService", () => {
  let categoryService;
  let mockCategoryRepo;

  beforeEach(() => {
    mockCategoryRepo = new CategoryRepository();
    categoryService = new CategoryService();
    jest.clearAllMocks();
  });

  describe("createCategory", () => {
    it("should create category successfully", async () => {
      const categoryData = { name: "Desserts", description: "Sweet recipes" };
      const createdCategory = { id: "1", ...categoryData };
      mockCategoryRepo.create.mockResolvedValue(createdCategory);

      const result = await categoryService.createCategory(categoryData);

      expect(mockCategoryRepo.create).toHaveBeenCalledWith(categoryData);
      expect(result).toBe(createdCategory);
    });
  });

  describe("getCategoryById", () => {
    it("should return category by id", async () => {
      const category = { id: "1", name: "Desserts" };
      mockCategoryRepo.findById.mockResolvedValue(category);

      const result = await categoryService.getCategoryById("1");

      expect(mockCategoryRepo.findById).toHaveBeenCalledWith("1");
      expect(result).toBe(category);
    });

    it("should throw error if category not found", async () => {
      mockCategoryRepo.findById.mockResolvedValue(null);

      await expect(categoryService.getCategoryById("1")).rejects.toThrow(
        "Category not found",
      );
    });
  });

  describe("updateCategory", () => {
    it("should update category successfully", async () => {
      const categoryId = "1";
      const updateData = { name: "Updated Category" };
      const updatedCategory = { id: categoryId, name: "Updated Category" };
      mockCategoryRepo.update.mockResolvedValue(updatedCategory);

      const result = await categoryService.updateCategory(
        categoryId,
        updateData,
      );

      expect(mockCategoryRepo.update).toHaveBeenCalledWith(
        categoryId,
        updateData,
      );
      expect(result).toBe(updatedCategory);
    });
  });

  describe("deleteCategory", () => {
    it("should delete category successfully", async () => {
      mockCategoryRepo.delete.mockResolvedValue({ id: "1" });

      const result = await categoryService.deleteCategory("1");

      expect(mockCategoryRepo.delete).toHaveBeenCalledWith("1");
      expect(result).toHaveProperty("id", "1");
    });
  });

  describe("getAllCategories", () => {
    it("should return paginated categories", async () => {
      const categories = [{ id: "1", name: "Desserts" }];
      mockCategoryRepo.findAll.mockResolvedValue(categories);

      const result = await categoryService.getAllCategories(1, 10);

      expect(mockCategoryRepo.findAll).toHaveBeenCalledWith(1, 10);
      expect(result).toBe(categories);
    });
  });

  describe("searchCategories", () => {
    it("should search categories by query", async () => {
      const categories = [{ id: "1", name: "Desserts" }];
      mockCategoryRepo.search.mockResolvedValue(categories);

      const result = await categoryService.searchCategories("dessert", 1, 10);

      expect(mockCategoryRepo.search).toHaveBeenCalledWith("dessert", 1, 10);
      expect(result).toBe(categories);
    });
  });
});
