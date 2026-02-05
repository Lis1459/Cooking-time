import { jest } from "@jest/globals";
import {
  getCuisines,
  createCuisine,
  updateCuisine,
  deleteCuisine,
} from "../controllers/cuisineController.js";
import { CuisineService } from "../services/cuisineService.js";

// Mock dependencies
jest.mock("../services/cuisineService.js");

describe("CuisineController", () => {
  let mockCuisineService;
  let mockRequest;
  let mockResponse;
  let mockNext;

  beforeEach(() => {
    mockCuisineService = new CuisineService();
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

  describe("createCuisine", () => {
    it("should create cuisine successfully", async () => {
      const cuisineData = { name: "Italian", description: "Italian cuisine" };
      const createdCuisine = { id: "1", ...cuisineData };
      mockRequest.body = cuisineData;
      mockCuisineService.createCuisine.mockResolvedValue(createdCuisine);

      await createCuisine(mockRequest, mockResponse, mockNext);

      expect(mockCuisineService.createCuisine).toHaveBeenCalledWith(
        cuisineData,
      );
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(createdCuisine);
    });
  });

  describe("getCuisines", () => {
    it("should return all cuisines", async () => {
      const cuisines = [{ id: "1", name: "Italian" }];
      mockCuisineService.getCuisines.mockResolvedValue(cuisines);

      await getCuisines(mockRequest, mockResponse, mockNext);

      expect(mockCuisineService.getCuisines).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith(cuisines);
    });
  });

  describe("updateCuisine", () => {
    it("should update cuisine successfully", async () => {
      const updateData = { name: "Updated Cuisine" };
      const updatedCuisine = { id: "1", name: "Updated Cuisine" };
      mockRequest.params.id = "1";
      mockRequest.body = updateData;
      mockCuisineService.updateCuisine.mockResolvedValue(updatedCuisine);

      await updateCuisine(mockRequest, mockResponse, mockNext);

      expect(mockCuisineService.updateCuisine).toHaveBeenCalledWith(
        "1",
        updateData,
      );
      expect(mockResponse.json).toHaveBeenCalledWith(updatedCuisine);
    });
  });

  describe("deleteCuisine", () => {
    it("should delete cuisine successfully", async () => {
      mockRequest.params.id = "1";
      mockCuisineService.deleteCuisine.mockResolvedValue();

      await deleteCuisine(mockRequest, mockResponse, mockNext);

      expect(mockCuisineService.deleteCuisine).toHaveBeenCalledWith("1");
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Cuisine deleted",
      });
    });
  });
});
