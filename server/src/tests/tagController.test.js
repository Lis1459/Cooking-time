import { jest } from "@jest/globals";
import {
  getTags,
  createTag,
  updateTag,
  deleteTag,
} from "../controllers/tagController.js";
import { TagService } from "../services/tagService.js";

// Mock dependencies
jest.mock("../services/tagService.js");

describe("TagController", () => {
  let mockTagService;
  let mockRequest;
  let mockResponse;
  let mockNext;

  beforeEach(() => {
    mockTagService = new TagService();
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

  describe("createTag", () => {
    it("should create tag successfully", async () => {
      const tagData = { name: "Vegan", description: "Plant-based recipes" };
      const createdTag = { id: "1", ...tagData };
      mockRequest.body = tagData;
      mockTagService.createTag.mockResolvedValue(createdTag);

      await createTag(mockRequest, mockResponse, mockNext);

      expect(mockTagService.createTag).toHaveBeenCalledWith(tagData);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(createdTag);
    });
  });

  describe("getTags", () => {
    it("should return all tags", async () => {
      const tags = [{ id: "1", name: "Vegan" }];
      mockTagService.getTags.mockResolvedValue(tags);

      await getTags(mockRequest, mockResponse, mockNext);

      expect(mockTagService.getTags).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith(tags);
    });
  });

  describe("updateTag", () => {
    it("should update tag successfully", async () => {
      const updateData = { name: "Updated Tag" };
      const updatedTag = { id: "1", name: "Updated Tag" };
      mockRequest.params.id = "1";
      mockRequest.body = updateData;
      mockTagService.updateTag.mockResolvedValue(updatedTag);

      await updateTag(mockRequest, mockResponse, mockNext);

      expect(mockTagService.updateTag).toHaveBeenCalledWith("1", updateData);
      expect(mockResponse.json).toHaveBeenCalledWith(updatedTag);
    });
  });

  describe("deleteTag", () => {
    it("should delete tag successfully", async () => {
      mockRequest.params.id = "1";
      mockTagService.deleteTag.mockResolvedValue();

      await deleteTag(mockRequest, mockResponse, mockNext);

      expect(mockTagService.deleteTag).toHaveBeenCalledWith("1");
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Tag deleted",
      });
    });
  });
});
