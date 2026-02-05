import { jest } from "@jest/globals";
import { TagService } from "../services/tagService.js";
import { TagRepository } from "../repositories/tagRepository.js";

// Mock dependencies
jest.mock("../repositories/tagRepository.js");

describe("TagService", () => {
  let tagService;
  let mockTagRepo;

  beforeEach(() => {
    mockTagRepo = new TagRepository();
    tagService = new TagService();
    jest.clearAllMocks();
  });

  describe("createTag", () => {
    it("should create tag successfully", async () => {
      const tagData = { name: "Vegan", description: "Plant-based recipes" };
      const createdTag = { id: "1", ...tagData };
      mockTagRepo.create.mockResolvedValue(createdTag);

      const result = await tagService.createTag(tagData);

      expect(mockTagRepo.create).toHaveBeenCalledWith(tagData);
      expect(result).toBe(createdTag);
    });
  });

  describe("getTagById", () => {
    it("should return tag by id", async () => {
      const tag = { id: "1", name: "Vegan" };
      mockTagRepo.findById.mockResolvedValue(tag);

      const result = await tagService.getTagById("1");

      expect(mockTagRepo.findById).toHaveBeenCalledWith("1");
      expect(result).toBe(tag);
    });

    it("should throw error if tag not found", async () => {
      mockTagRepo.findById.mockResolvedValue(null);

      await expect(tagService.getTagById("1")).rejects.toThrow("Tag not found");
    });
  });

  describe("updateTag", () => {
    it("should update tag successfully", async () => {
      const tagId = "1";
      const updateData = { name: "Updated Tag" };
      const updatedTag = { id: tagId, name: "Updated Tag" };
      mockTagRepo.update.mockResolvedValue(updatedTag);

      const result = await tagService.updateTag(tagId, updateData);

      expect(mockTagRepo.update).toHaveBeenCalledWith(tagId, updateData);
      expect(result).toBe(updatedTag);
    });
  });

  describe("deleteTag", () => {
    it("should delete tag successfully", async () => {
      mockTagRepo.delete.mockResolvedValue({ id: "1" });

      const result = await tagService.deleteTag("1");

      expect(mockTagRepo.delete).toHaveBeenCalledWith("1");
      expect(result).toHaveProperty("id", "1");
    });
  });

  describe("getAllTags", () => {
    it("should return paginated tags", async () => {
      const tags = [{ id: "1", name: "Vegan" }];
      mockTagRepo.findAll.mockResolvedValue(tags);

      const result = await tagService.getAllTags(1, 10);

      expect(mockTagRepo.findAll).toHaveBeenCalledWith(1, 10);
      expect(result).toBe(tags);
    });
  });

  describe("searchTags", () => {
    it("should search tags by query", async () => {
      const tags = [{ id: "1", name: "Vegan" }];
      mockTagRepo.search.mockResolvedValue(tags);

      const result = await tagService.searchTags("vegan", 1, 10);

      expect(mockTagRepo.search).toHaveBeenCalledWith("vegan", 1, 10);
      expect(result).toBe(tags);
    });
  });
});
