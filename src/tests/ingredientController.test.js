import { jest } from "@jest/globals";
import {
  getIngredients,
  createIngredient,
  updateIngredient,
  deleteIngredient,
} from "../controllers/ingredientController.js";
import { IngredientService } from "../services/ingredientService.js";

// Mock dependencies
jest.mock("../services/ingredientService.js");

describe("IngredientController", () => {
  let mockIngredientService;
  let mockRequest;
  let mockResponse;
  let mockNext;

  beforeEach(() => {
    mockIngredientService = new IngredientService();
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

  describe("createIngredient", () => {
    it("should create ingredient successfully", async () => {
      const ingredientData = { name: "Tomato", unit: "kg" };
      const createdIngredient = { id: "1", ...ingredientData };
      mockRequest.body = ingredientData;
      mockIngredientService.createIngredient.mockResolvedValue(
        createdIngredient,
      );

      await createIngredient(mockRequest, mockResponse, mockNext);

      expect(mockIngredientService.createIngredient).toHaveBeenCalledWith(
        ingredientData,
      );
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(createdIngredient);
    });
  });

  describe("getIngredients", () => {
    it("should return paginated ingredients", async () => {
      const ingredients = [{ id: "1", name: "Tomato" }];
      const total = 1;
      mockRequest.query = { page: "1", limit: "10" };
      mockIngredientService.getIngredients.mockResolvedValue(ingredients);
      mockIngredientService.getIngredientCount.mockResolvedValue(total);

      await getIngredients(mockRequest, mockResponse, mockNext);

      expect(mockIngredientService.getIngredients).toHaveBeenCalledWith(1, 10);
      expect(mockIngredientService.getIngredientCount).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith({
        ingredients,
        total,
        page: 1,
        limit: 10,
      });
    });
  });

  describe("updateIngredient", () => {
    it("should update ingredient successfully", async () => {
      const updateData = { name: "Cherry Tomato" };
      const updatedIngredient = { id: "1", name: "Cherry Tomato" };
      mockRequest.params.id = "1";
      mockRequest.body = updateData;
      mockIngredientService.updateIngredient.mockResolvedValue(
        updatedIngredient,
      );

      await updateIngredient(mockRequest, mockResponse, mockNext);

      expect(mockIngredientService.updateIngredient).toHaveBeenCalledWith(
        "1",
        updateData,
      );
      expect(mockResponse.json).toHaveBeenCalledWith(updatedIngredient);
    });
  });

  describe("deleteIngredient", () => {
    it("should delete ingredient successfully", async () => {
      mockRequest.params.id = "1";
      mockIngredientService.deleteIngredient.mockResolvedValue();

      await deleteIngredient(mockRequest, mockResponse, mockNext);

      expect(mockIngredientService.deleteIngredient).toHaveBeenCalledWith("1");
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Ingredient deleted",
      });
    });
  });
});
