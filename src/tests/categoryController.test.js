import { jest } from "@jest/globals";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";
import { CategoryService } from "../services/categoryService.js";

// Mock dependencies
jest.mock("../services/categoryService.js");

describe("CategoryController", () => {
  let mockCategoryService;
  let mockRequest;
  let mockResponse;
  let mockNext;

  beforeEach(() => {
    mockCategoryService = new CategoryService();
    mockRequest = {
      body: {},
      params: {},
      query: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe("createCategory", () => {
    it("should create category successfully", async () => {
      const categoryData = { name: "Desserts", description: "Sweet recipes" };
      const createdCategory = { id: "1", ...categoryData };
      mockRequest.body = categoryData;
      mockCategoryService.createCategory.mockResolvedValue(createdCategory);

      await createCategory(mockRequest, mockResponse, mockNext);

      expect(mockCategoryService.createCategory).toHaveBeenCalledWith(
        categoryData,
      );
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(createdCategory);
    });
  });

  describe("getCategories", () => {
    it("should return all categories", async () => {
      const categories = [{ id: "1", name: "Desserts" }];
      mockCategoryService.getCategories.mockResolvedValue(categories);

      await getCategories(mockRequest, mockResponse, mockNext);

      expect(mockCategoryService.getCategories).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith(categories);
    });
  });

  describe("updateCategory", () => {
    it("should update category successfully", async () => {
      const updateData = { name: "Updated Category" };
      const updatedCategory = { id: "1", name: "Updated Category" };
      mockRequest.params.id = "1";
      mockRequest.body = updateData;
      mockCategoryService.updateCategory.mockResolvedValue(updatedCategory);

      await updateCategory(mockRequest, mockResponse, mockNext);

      expect(mockCategoryService.updateCategory).toHaveBeenCalledWith(
        "1",
        updateData,
      );
      expect(mockResponse.json).toHaveBeenCalledWith(updatedCategory);
    });
  });

  describe("deleteCategory", () => {
    it("should delete category successfully", async () => {
      mockRequest.params.id = "1";
      mockCategoryService.deleteCategory.mockResolvedValue();

      await deleteCategory(mockRequest, mockResponse, mockNext);

      expect(mockCategoryService.deleteCategory).toHaveBeenCalledWith("1");
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Category deleted",
      });
    });
  });
});
