import { jest } from "@jest/globals";
import { CuisineService } from "../services/cuisineService.js";
import { CuisineRepository } from "../repositories/cuisineRepository.js";

// Mock dependencies
jest.mock("../repositories/cuisineRepository.js");

describe("CuisineService", () => {
  let cuisineService;
  let mockCuisineRepo;

  beforeEach(() => {
    mockCuisineRepo = new CuisineRepository();
    cuisineService = new CuisineService();
    jest.clearAllMocks();
  });

  describe("createCuisine", () => {
    it("should create cuisine successfully", async () => {
      const cuisineData = { name: "Italian", description: "Italian cuisine" };
      const createdCuisine = { id: "1", ...cuisineData };
      mockCuisineRepo.create.mockResolvedValue(createdCuisine);

      const result = await cuisineService.createCuisine(cuisineData);

      expect(mockCuisineRepo.create).toHaveBeenCalledWith(cuisineData);
      expect(result).toBe(createdCuisine);
    });
  });

  describe("getCuisineById", () => {
    it("should return cuisine by id", async () => {
      const cuisine = { id: "1", name: "Italian" };
      mockCuisineRepo.findById.mockResolvedValue(cuisine);

      const result = await cuisineService.getCuisineById("1");

      expect(mockCuisineRepo.findById).toHaveBeenCalledWith("1");
      expect(result).toBe(cuisine);
    });

    it("should throw error if cuisine not found", async () => {
      mockCuisineRepo.findById.mockResolvedValue(null);

      await expect(cuisineService.getCuisineById("1")).rejects.toThrow(
        "Cuisine not found",
      );
    });
  });

  describe("updateCuisine", () => {
    it("should update cuisine successfully", async () => {
      const cuisineId = "1";
      const updateData = { name: "Updated Cuisine" };
      const updatedCuisine = { id: cuisineId, name: "Updated Cuisine" };
      mockCuisineRepo.update.mockResolvedValue(updatedCuisine);

      const result = await cuisineService.updateCuisine(cuisineId, updateData);

      expect(mockCuisineRepo.update).toHaveBeenCalledWith(
        cuisineId,
        updateData,
      );
      expect(result).toBe(updatedCuisine);
    });
  });

  describe("deleteCuisine", () => {
    it("should delete cuisine successfully", async () => {
      mockCuisineRepo.delete.mockResolvedValue({ id: "1" });

      const result = await cuisineService.deleteCuisine("1");

      expect(mockCuisineRepo.delete).toHaveBeenCalledWith("1");
      expect(result).toHaveProperty("id", "1");
    });
  });

  describe("getAllCuisines", () => {
    it("should return paginated cuisines", async () => {
      const cuisines = [{ id: "1", name: "Italian" }];
      mockCuisineRepo.findAll.mockResolvedValue(cuisines);

      const result = await cuisineService.getAllCuisines(1, 10);

      expect(mockCuisineRepo.findAll).toHaveBeenCalledWith(1, 10);
      expect(result).toBe(cuisines);
    });
  });

  describe("searchCuisines", () => {
    it("should search cuisines by query", async () => {
      const cuisines = [{ id: "1", name: "Italian" }];
      mockCuisineRepo.search.mockResolvedValue(cuisines);

      const result = await cuisineService.searchCuisines("italian", 1, 10);

      expect(mockCuisineRepo.search).toHaveBeenCalledWith("italian", 1, 10);
      expect(result).toBe(cuisines);
    });
  });
});
