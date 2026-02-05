import { jest } from '@jest/globals';
import { createRecipe, getRecipeById, updateRecipe, deleteRecipe, getAllRecipes, searchRecipes, getRecipesByUser, getRecipesByCategory, getRecipesByTag, getRecipesByCuisine, addToFavorites, removeFromFavorites, getFavoriteRecipes, rateRecipe, getRecipeRating, getCookHistory, addToCookHistory } from '../controllers/recipeController.js';
import { RecipeService } from '../services/recipeService.js';

// Mock dependencies
jest.mock('../services/recipeService.js');

describe('RecipeController', () => {
  let mockRecipeService;
  let mockRequest;
  let mockResponse;
  let mockNext;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Get the mock instance
    mockRecipeService = new RecipeService();
    
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

  describe('createRecipe', () => {
    it('should create recipe successfully', async () => {
      const recipeData = { title: 'Test Recipe', description: 'Test Description' };
      const createdRecipe = { id: '1', ...recipeData };
      mockRequest.body = recipeData;
      mockRecipeService.createRecipe.mockResolvedValue(createdRecipe);

      await createRecipe(mockRequest, mockResponse, mockNext);

      expect(mockRecipeService.createRecipe).toHaveBeenCalledWith(recipeData, '1');
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(createdRecipe);
    });
  });

  describe('getRecipeById', () => {
    it('should get recipe by id successfully', async () => {
      const recipe = { id: '1', title: 'Test Recipe' };
      mockRequest.params.id = '1';
      mockRecipeService.getRecipeById.mockResolvedValue(recipe);

      await getRecipeById(mockRequest, mockResponse, mockNext);

      expect(mockRecipeService.getRecipeById).toHaveBeenCalledWith('1');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(recipe);
    });
  });

  describe('updateRecipe', () => {
    it('should update recipe successfully', async () => {
      const updateData = { title: 'Updated Recipe' };
      const updatedRecipe = { id: '1', ...updateData };
      mockRequest.params.id = '1';
      mockRequest.body = updateData;
      mockRecipeService.updateRecipe.mockResolvedValue(updatedRecipe);

      await updateRecipe(mockRequest, mockResponse, mockNext);

      expect(mockRecipeService.updateRecipe).toHaveBeenCalledWith('1', updateData, '1');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(updatedRecipe);
    });
  });

  describe('deleteRecipe', () => {
    it('should delete recipe successfully', async () => {
      mockRequest.params.id = '1';
      mockRecipeService.deleteRecipe.mockResolvedValue();

      await deleteRecipe(mockRequest, mockResponse, mockNext);

      expect(mockRecipeService.deleteRecipe).toHaveBeenCalledWith('1', '1');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Recipe deleted successfully' });
    });
  });

  describe('getAllRecipes', () => {
    it('should get all recipes successfully', async () => {
      const recipes = [{ id: '1', title: 'Recipe 1' }];
      mockRecipeService.getAllRecipes.mockResolvedValue(recipes);

      await getAllRecipes(mockRequest, mockResponse, mockNext);

      expect(mockRecipeService.getAllRecipes).toHaveBeenCalledWith({});
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(recipes);
    });
  });

  describe('searchRecipes', () => {
    it('should search recipes successfully', async () => {
      const recipes = [{ id: '1', title: 'Recipe 1' }];
      mockRequest.query.q = 'test';
      mockRecipeService.searchRecipes.mockResolvedValue(recipes);

      await searchRecipes(mockRequest, mockResponse, mockNext);

      expect(mockRecipeService.searchRecipes).toHaveBeenCalledWith('test');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(recipes);
    });
  });

  describe('getRecipesByUser', () => {
    it('should get recipes by user successfully', async () => {
      const recipes = [{ id: '1', title: 'Recipe 1' }];
      mockRequest.params.userId = '1';
      mockRecipeService.getRecipesByUser.mockResolvedValue(recipes);

      await getRecipesByUser(mockRequest, mockResponse, mockNext);

      expect(mockRecipeService.getRecipesByUser).toHaveBeenCalledWith('1');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(recipes);
    });
  });

  describe('getRecipesByCategory', () => {
    it('should get recipes by category successfully', async () => {
      const recipes = [{ id: '1', title: 'Recipe 1' }];
      mockRequest.params.categoryId = '1';
      mockRecipeService.getRecipesByCategory.mockResolvedValue(recipes);

      await getRecipesByCategory(mockRequest, mockResponse, mockNext);

      expect(mockRecipeService.getRecipesByCategory).toHaveBeenCalledWith('1');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(recipes);
    });
  });

  describe('getRecipesByTag', () => {
    it('should get recipes by tag successfully', async () => {
      const recipes = [{ id: '1', title: 'Recipe 1' }];
      mockRequest.params.tagId = '1';
      mockRecipeService.getRecipesByTag.mockResolvedValue(recipes);

      await getRecipesByTag(mockRequest, mockResponse, mockNext);

      expect(mockRecipeService.getRecipesByTag).toHaveBeenCalledWith('1');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(recipes);
    });
  });

  describe('getRecipesByCuisine', () => {
    it('should get recipes by cuisine successfully', async () => {
      const recipes = [{ id: '1', title: 'Recipe 1' }];
      mockRequest.params.cuisineId = '1';
      mockRecipeService.getRecipesByCuisine.mockResolvedValue(recipes);

      await getRecipesByCuisine(mockRequest, mockResponse, mockNext);

      expect(mockRecipeService.getRecipesByCuisine).toHaveBeenCalledWith('1');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(recipes);
    });
  });

  describe('addToFavorites', () => {
    it('should add recipe to favorites successfully', async () => {
      mockRequest.params.id = '1';
      mockRecipeService.addToFavorites.mockResolvedValue();

      await addToFavorites(mockRequest, mockResponse, mockNext);

      expect(mockRecipeService.addToFavorites).toHaveBeenCalledWith('1', '1');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Recipe added to favorites' });
    });
  });

  describe('removeFromFavorites', () => {
    it('should remove recipe from favorites successfully', async () => {
      mockRequest.params.id = '1';
      mockRecipeService.removeFromFavorites.mockResolvedValue();

      await removeFromFavorites(mockRequest, mockResponse, mockNext);

      expect(mockRecipeService.removeFromFavorites).toHaveBeenCalledWith('1', '1');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Recipe removed from favorites' });
    });
  });

  describe('getFavoriteRecipes', () => {
    it('should get favorite recipes successfully', async () => {
      const recipes = [{ id: '1', title: 'Recipe 1' }];
      mockRecipeService.getFavoriteRecipes.mockResolvedValue(recipes);

      await getFavoriteRecipes(mockRequest, mockResponse, mockNext);

      expect(mockRecipeService.getFavoriteRecipes).toHaveBeenCalledWith('1');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(recipes);
    });
  });

  describe('rateRecipe', () => {
    it('should rate recipe successfully', async () => {
      const ratingData = { rating: 5 };
      mockRequest.params.id = '1';
      mockRequest.body = ratingData;
      mockRecipeService.rateRecipe.mockResolvedValue();

      await rateRecipe(mockRequest, mockResponse, mockNext);

      expect(mockRecipeService.rateRecipe).toHaveBeenCalledWith('1', '1', 5);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Recipe rated successfully' });
    });
  });

  describe('getRecipeRating', () => {
    it('should get recipe rating successfully', async () => {
      const rating = { average: 4.5, count: 10 };
      mockRequest.params.id = '1';
      mockRecipeService.getRecipeRating.mockResolvedValue(rating);

      await getRecipeRating(mockRequest, mockResponse, mockNext);

      expect(mockRecipeService.getRecipeRating).toHaveBeenCalledWith('1');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(rating);
    });
  });

  describe('getCookHistory', () => {
    it('should get cook history successfully', async () => {
      const history = [{ id: '1', recipeId: '1', cookedAt: new Date() }];
      mockRecipeService.getCookHistory.mockResolvedValue(history);

      await getCookHistory(mockRequest, mockResponse, mockNext);

      expect(mockRecipeService.getCookHistory).toHaveBeenCalledWith('1');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(history);
    });
  });

  describe('addToCookHistory', () => {
    it('should add to cook history successfully', async () => {
      mockRequest.params.id = '1';
      mockRecipeService.addToCookHistory.mockResolvedValue();

      await addToCookHistory(mockRequest, mockResponse, mockNext);

      expect(mockRecipeService.addToCookHistory).toHaveBeenCalledWith('1', '1');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Recipe added to cook history' });
    });
  });
});