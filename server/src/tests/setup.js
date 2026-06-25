// Setup for tests
require("dotenv").config();

// Setup for tests
require("dotenv").config();

// Mock bcrypt
jest.mock("bcryptjs", () => ({
  hash: jest.fn().mockResolvedValue("$2a$10$mockedhash"),
  compare: jest.fn().mockResolvedValue(true),
}));

// Mock jwt utils
jest.mock("../utils/jwt.js", () => ({
  generateAccessToken: jest.fn().mockReturnValue("mock-access-token"),
  generateRefreshToken: jest.fn().mockReturnValue("mock-refresh-token"),
  verifyToken: jest.fn(),
}));

// Mock redis
jest.mock("../config/redis.js", () => ({
  get: jest.fn(),
  setEx: jest.fn(),
  del: jest.fn(),
}));

// Mock database
jest.mock("../config/database.js", () => ({
  default: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
    },
    refreshToken: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      deleteMany: jest.fn(),
    },
    recipe: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
    },
    comment: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
    },
    report: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
    },
    notification: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
    },
    ingredient: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
    },
    category: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
    },
    tag: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
    },
    cuisine: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
    },
    subscription: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
    },
  },
}));

// Mock repositories with module-level mocks
jest.mock("../repositories/userRepository.js", () => {
  const mockUserRepo = {
    findByEmail: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findAllUsers: jest.fn(),
    countUsers: jest.fn(),
  };

  return {
    UserRepository: jest.fn(() => mockUserRepo),
  };
});

jest.mock("../repositories/recipeRepository.js", () => {
  const mockRecipeRepo = {
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findAll: jest.fn(),
    findByUserId: jest.fn(),
    countByUserId: jest.fn(),
    search: jest.fn(),
    findByCategory: jest.fn(),
    findByCuisine: jest.fn(),
    findByTag: jest.fn(),
    addToFavorites: jest.fn(),
    removeFromFavorites: jest.fn(),
    getFavorites: jest.fn(),
    addCookHistory: jest.fn(),
    getCookHistory: jest.fn(),
    findByRecipeId: jest.fn(),
  };

  return {
    RecipeRepository: jest.fn(() => mockRecipeRepo),
  };
});

jest.mock("../repositories/commentRepository.js", () => {
  const mockCommentRepo = {
    findById: jest.fn(),
    findByRecipe: jest.fn(),
    countByRecipe: jest.fn(),
    findByUserId: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  return {
    CommentRepository: jest.fn(() => mockCommentRepo),
  };
});

jest.mock("../repositories/reportRepository.js", () => {
  const mockReportRepo = {
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findAll: jest.fn(),
    findByRecipeId: jest.fn(),
    findByUserId: jest.fn(),
  };

  return {
    ReportRepository: jest.fn(() => mockReportRepo),
  };
});

jest.mock("../repositories/notificationRepository.js", () => {
  const mockNotificationRepo = {
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findByUserId: jest.fn(),
    markAsRead: jest.fn(),
    markAllAsRead: jest.fn(),
    getUnreadCount: jest.fn(),
  };

  return {
    NotificationRepository: jest.fn(() => mockNotificationRepo),
  };
});

jest.mock("../repositories/ingredientRepository.js", () => {
  const mockIngredientRepo = {
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findAll: jest.fn(),
    search: jest.fn(),
    count: jest.fn(),
  };

  return {
    IngredientRepository: jest.fn(() => mockIngredientRepo),
  };
});

jest.mock("../repositories/categoryRepository.js", () => {
  const mockCategoryRepo = {
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findAll: jest.fn(),
  };

  return {
    CategoryRepository: jest.fn(() => mockCategoryRepo),
  };
});

jest.mock("../repositories/tagRepository.js", () => {
  const mockTagRepo = {
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findAll: jest.fn(),
    search: jest.fn(),
  };

  return {
    TagRepository: jest.fn(() => mockTagRepo),
  };
});

jest.mock("../repositories/cuisineRepository.js", () => {
  const mockCuisineRepo = {
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findAll: jest.fn(),
  };

  return {
    CuisineRepository: jest.fn(() => mockCuisineRepo),
  };
});

jest.mock("../repositories/subscriptionRepository.js", () => {
  const mockSubscriptionRepo = {
    findById: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
    findBySubscriberId: jest.fn(),
    findBySubscribedToId: jest.fn(),
    isSubscribed: jest.fn(),
    countSubscribers: jest.fn(),
  };

  return {
    SubscriptionRepository: jest.fn(() => mockSubscriptionRepo),
  };
});
