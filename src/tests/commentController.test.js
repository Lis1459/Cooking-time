import { jest } from '@jest/globals';
import { createComment, getCommentById, updateComment, deleteComment, getCommentsByRecipe, getCommentsByUser } from '../controllers/commentController.js';
import { CommentService } from '../services/commentService.js';

// Mock dependencies
jest.mock('../services/commentService.js');

describe('CommentController', () => {
  let mockCommentService;
  let mockRequest;
  let mockResponse;
  let mockNext;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Get the mock instance
    mockCommentService = new CommentService();
    
    mockRequest = {
      body: {},
      params: {},
      query: {},
      user: { id: '1' },
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
  });
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('createComment', () => {
    it('should create comment successfully', async () => {
      const commentData = { content: 'Great recipe!', recipe_id: '1' };
      const createdComment = { id: '1', ...commentData, user_id: '1' };
      mockRequest.body = commentData;
      mockCommentService.createComment.mockResolvedValue(createdComment);

      await createComment(mockRequest, mockResponse, mockNext);

      expect(mockCommentService.createComment).toHaveBeenCalledWith(commentData, '1');
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(createdComment);
    });
  });

  describe('getCommentById', () => {
    it('should get comment by id successfully', async () => {
      const comment = { id: '1', content: 'Great recipe!' };
      mockRequest.params.id = '1';
      mockCommentService.getCommentById.mockResolvedValue(comment);

      await getCommentById(mockRequest, mockResponse, mockNext);

      expect(mockCommentService.getCommentById).toHaveBeenCalledWith('1');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(comment);
    });
  });

  describe('updateComment', () => {
    it('should update comment successfully', async () => {
      const updateData = { content: 'Updated comment' };
      const updatedComment = { id: '1', content: 'Updated comment' };
      mockRequest.params.id = '1';
      mockRequest.body = updateData;
      mockCommentService.updateComment.mockResolvedValue(updatedComment);

      await updateComment(mockRequest, mockResponse, mockNext);

      expect(mockCommentService.updateComment).toHaveBeenCalledWith('1', updateData, '1');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(updatedComment);
    });
  });

  describe('deleteComment', () => {
    it('should delete comment successfully', async () => {
      mockRequest.params.id = '1';
      mockCommentService.deleteComment.mockResolvedValue();

      await deleteComment(mockRequest, mockResponse, mockNext);

      expect(mockCommentService.deleteComment).toHaveBeenCalledWith('1', '1');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Comment deleted successfully' });
    });
  });

  describe('getCommentsByRecipe', () => {
    it('should get comments by recipe successfully', async () => {
      const comments = [{ id: '1', content: 'Great!' }];
      mockRequest.params.recipeId = '1';
      mockCommentService.getCommentsByRecipe.mockResolvedValue(comments);

      await getCommentsByRecipe(mockRequest, mockResponse, mockNext);

      expect(mockCommentService.getCommentsByRecipe).toHaveBeenCalledWith('1');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(comments);
    });
  });

  describe('getCommentsByUser', () => {
    it('should get comments by user successfully', async () => {
      const comments = [{ id: '1', content: 'My comment' }];
      mockRequest.params.userId = '1';
      mockCommentService.getCommentsByUser.mockResolvedValue(comments);

      await getCommentsByUser(mockRequest, mockResponse, mockNext);

      expect(mockCommentService.getCommentsByUser).toHaveBeenCalledWith('1');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(comments);
    });
  });
});