import { jest } from "@jest/globals";
import { CommentService } from "../services/commentService.js";
import { CommentRepository } from "../repositories/commentRepository.js";

// Mock dependencies
jest.mock("../repositories/commentRepository.js");

describe("CommentService", () => {
  let commentService;
  let mockCommentRepo;

  beforeEach(() => {
    mockCommentRepo = new CommentRepository();
    commentService = new CommentService();
    jest.clearAllMocks();
  });

  describe("createComment", () => {
    it("should create comment successfully", async () => {
      const commentData = {
        content: "Great recipe!",
        recipe_id: "1",
        user_id: "1",
      };
      const createdComment = { id: "1", ...commentData };
      mockCommentRepo.create.mockResolvedValue(createdComment);

      const result = await commentService.createComment(commentData);

      expect(mockCommentRepo.create).toHaveBeenCalledWith(commentData);
      expect(result).toBe(createdComment);
    });
  });

  describe("getCommentById", () => {
    it("should return comment by id", async () => {
      const comment = { id: "1", content: "Great recipe!" };
      mockCommentRepo.findById.mockResolvedValue(comment);

      const result = await commentService.getCommentById("1");

      expect(mockCommentRepo.findById).toHaveBeenCalledWith("1");
      expect(result).toBe(comment);
    });

    it("should throw error if comment not found", async () => {
      mockCommentRepo.findById.mockResolvedValue(null);

      await expect(commentService.getCommentById("1")).rejects.toThrow(
        "Comment not found",
      );
    });
  });

  describe("updateComment", () => {
    it("should update comment successfully", async () => {
      const commentId = "1";
      const updateData = { content: "Updated comment" };
      const updatedComment = { id: commentId, content: "Updated comment" };
      mockCommentRepo.update.mockResolvedValue(updatedComment);

      const result = await commentService.updateComment(commentId, updateData);

      expect(mockCommentRepo.update).toHaveBeenCalledWith(
        commentId,
        updateData,
      );
      expect(result).toBe(updatedComment);
    });
  });

  describe("deleteComment", () => {
    it("should delete comment successfully", async () => {
      const comment = { id: "1", recipe_id: "1" };
      mockCommentRepo.findById.mockResolvedValue(comment);
      mockCommentRepo.delete.mockResolvedValue({ id: "1" });

      const result = await commentService.deleteComment("1");

      expect(mockCommentRepo.findById).toHaveBeenCalledWith("1");
      expect(mockCommentRepo.delete).toHaveBeenCalledWith("1");
      expect(result).toHaveProperty("id", "1");
    });
  });

  describe("getCommentsByRecipe", () => {
    it("should return comments by recipe", async () => {
      const comments = [{ id: "1", content: "Great!" }];
      const total = 1;
      mockCommentRepo.findByRecipe.mockResolvedValue(comments);
      mockCommentRepo.countByRecipe.mockResolvedValue(total);

      const result = await commentService.getCommentsByRecipe("1", 1, 10);

      expect(mockCommentRepo.findByRecipe).toHaveBeenCalledWith("1", 1, 10);
      expect(result).toHaveProperty("comments", comments);
      expect(result).toHaveProperty("total", total);
    });
  });

  describe("getCommentsByUser", () => {
    it("should return comments by user", async () => {
      const comments = [{ id: "1", content: "My comment" }];
      mockCommentRepo.findByUserId.mockResolvedValue(comments);

      const result = await commentService.getCommentsByUser("1", 1, 10);

      expect(mockCommentRepo.findByUserId).toHaveBeenCalledWith("1", 1, 10);
      expect(result).toBe(comments);
    });
  });
});
