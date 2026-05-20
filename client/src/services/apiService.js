import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../config/api";
import { toast } from "sonner";

// const isAuthenticated = localStorage.getItem("accessToken");
// console.log(isAuthenticated);

// ============= AUTH HOOKS =============

// export const useLoginMutation = () => {
//   return useMutation({
//     mutationFn: async (credentials) => {
//       const response = await api.post("/auth/login", credentials);
//       const { accessToken, refreshToken } = response.data;
//       if (accessToken) {
//         localStorage.setItem("accessToken", accessToken);
//         localStorage.setItem("refreshToken", refreshToken);
//       }
//       return response.data;
//     },
//   });
// };

// export const useRegisterMutation = () => {
//   return useMutation({
//     mutationFn: async (userData) => {
//       const response = await api.post("/auth/register", userData);
//       const { accessToken, refreshToken } = response.data;
//       if (accessToken) {
//         localStorage.setItem("accessToken", accessToken);
//         localStorage.setItem("refreshToken", refreshToken);
//       }
//       return response.data;
//     },
//   });
// };

// export const useLogoutMutation = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: async () => {
//       await api.post("/auth/logout");
//       localStorage.removeItem("accessToken");
//       localStorage.removeItem("refreshToken");
//       localStorage.removeItem("user");
//     },
//     onSuccess: () => {
//       queryClient.clear();
//     },
//   });
// };

// export const useRefreshTokenMutation = () => {
//   return useMutation({
//     mutationFn: async (refreshToken) => {
//       const response = await api.post("/auth/refresh", { refreshToken });
//       if (response.data.accessToken) {
//         localStorage.setItem("accessToken", response.data.accessToken);
//         localStorage.setItem("refreshToken", response.data.refreshToken);
//       }
//       return response.data;
//     },
//   });
// };

// ============= USER HOOKS =============

export const useUserProfileQuery = (userId, options = {}) => {
  return useQuery({
    queryKey: ["userProfile", userId],
    queryFn: async () => {
      const response = await api.get(`/users/profile/${userId}`);
      return response.data;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

export const useUpdateProfileMutation = (userId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profileData) => {
      const response = await api.put(`/users/profile/${userId}`, profileData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile", userId] });
    },
  });
};

export const useAllUsersQuery = (page = 1, limit = 10, options = {}) => {
  return useQuery({
    queryKey: ["allUsers", page, limit],
    queryFn: async () => {
      const response = await api.get("/users", {
        params: { page, limit },
      });
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
};

export const useBlockUserMutation = () => {
  return useMutation({
    mutationFn: async (userId) => {
      const response = await api.put(`/users/${userId}/block`);
      return response.data;
    },
  });
};

export const useUnblockUserMutation = () => {
  return useMutation({
    mutationFn: async (userId) => {
      const response = await api.put(`/users/${userId}/unblock`);
      return response.data;
    },
  });
};

export const useDeleteUserMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId) => {
      return api.delete(`/users/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allUsers"] });
    },
  });
};

// ============= RECIPE HOOKS =============

export const useRecipesQuery = (params = {}, options = {}) => {
  return useQuery({
    queryKey: ["recipes", params],
    queryFn: async () => {
      const response = await api.get("/recipes", { params });
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

export const useRecipeQuery = (id, params = {}, options = {}) => {
  return useQuery({
    queryKey: ["recipe", id],
    queryFn: async () => {
      const response = await api.get(`/recipes/${id}`, { params });
      return response.data;
    },
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
};

export const useRecipeAverageQuery = (id, options = {}) => {
  return useQuery({
    queryKey: ["recipeAverage", id],
    queryFn: async () => {
      const response = await api.get(`/recipes/${id}/ratings`);
      return response.data;
    },
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
    ...options,
  });
};

export const usePopularRecipesQuery = (options = {}) => {
  return useQuery({
    queryKey: ["popularRecipes"],
    queryFn: async () => {
      const response = await api.get("/recipes/popular");
      return response.data;
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
    ...options,
  });
};

export const useMyRecipesQuery = (userId, params = {}, options = {}) => {
  return useQuery({
    queryKey: ["myRecipes", userId, params],
    queryFn: async () => {
      const response = await api.get("/recipes/my", { params });
      return response.data;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

export const useCreateRecipeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData) => {
      const response = await api.post("/recipes", formData);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Рецепт успешно добавлен!");
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
    },
  });
};

export const useUpdateRecipeMutation = (id) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (recipeData) => {
      const response = await api.put(`/recipes/${id}`, recipeData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
      queryClient.invalidateQueries({ queryKey: ["recipe", id] });
    },
  });
};

export const useDeleteRecipeMutation = (id) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      return api.delete(`/recipes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
    },
  });
};

export const useAddToFavoritesMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const response = await api.post(`/recipes/${id}/favorite`);
      return response.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["recipe", id] });
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
    },
  });
};

export const useRemoveFromFavoritesMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      return api.delete(`/recipes/${id}/favorite`);
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["recipe", id] });
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
    },
  });
};

export const useMarkRecipeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }) => {
      console.log("id and status", id, { status });
      const response = await api.post(`/recipes/${id}/cook`, { status });
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["recipe", id] });
    },
  });
};

// ============= COMMENT HOOKS =============

export const useCommentsQuery = (
  recipeId,
  page = 1,
  limit = 10,
  options = {},
) => {
  return useQuery({
    queryKey: ["comments", recipeId, page, limit],
    queryFn: async () => {
      const response = await api.get(`/recipes/${recipeId}/comments`, {
        params: { page, limit },
      });
      return response.data;
    },
    enabled: !!recipeId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });
};

export const useCreateCommentMutation = (recipeId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (commentData) => {
      const response = await api.post(
        `/recipes/${recipeId}/comments`,
        commentData,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", recipeId] });
    },
  });
};

export const useUpdateCommentMutation = (recipeId, commentId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (commentData) => {
      const response = await api.put(
        `/recipes/${recipeId}/comments/${commentId}`,
        commentData,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", recipeId] });
    },
  });
};

export const useDeleteCommentMutation = (recipeId, commentId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      return api.delete(`/recipes/${recipeId}/comments/${commentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", recipeId] });
    },
  });
};

// ============ RATE HOOKS ==================

export const useRateQuery = (id, isAuthenticated, options = {}) => {
  // for a specific authenticated user rating
  return useQuery({
    queryKey: ["userRating", id],
    queryFn: async () => {
      const response = await api.get(`/recipes/${id}/ratings/user`);
      return response.data;
    },
    staleTime: 10 * 60 * 1000,
    enabled: !!isAuthenticated,
    ...options,
  });
};

export const useRateRecipeMutation = (id) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (rateData) => {
      const responce = await api.post(`/recipes/${id}/ratings`, rateData);
      return responce.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userRating", id] });
      queryClient.invalidateQueries({ queryKey: ["recipeAverage", id] });
    },
  });
};

// export const useUpdateRateMutation = (id) => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: async (rateData) => {
//       const responce = await api.put(`/recipes/${id}`, rateData);
//       return responce.data;
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["rate", id] });
//     },
//   });
// };

// ============= CATEGORY HOOKS =============

export const useCategoriesQuery = (options = {}) => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await api.get("/categories");
      return response.data;
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
    ...options,
  });
};

export const useCreateCategoryMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (categoryData) => {
      const response = await api.post("/categories", categoryData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
};

export const useUpdateCategoryMutation = (id) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (categoryData) => {
      const response = await api.put(`/categories/${id}`, categoryData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
};

export const useDeleteCategoryMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      return api.delete(`/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
};

// ============= TAG HOOKS =============

export const useTagsQuery = (options = {}) => {
  return useQuery({
    queryKey: ["tags"],
    queryFn: async () => {
      const response = await api.get("/tags");
      return response.data;
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
    ...options,
  });
};

export const useCreateTagMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (tagData) => {
      const response = await api.post("/tags", tagData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
  });
};

export const useUpdateTagMutation = (id) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (tagData) => {
      const response = await api.put(`/tags/${id}`, tagData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
  });
};

export const useDeleteTagMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      return api.delete(`/tags/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
  });
};

// ============= CUISINE HOOKS =============

export const useCuisinesQuery = (options = {}) => {
  return useQuery({
    queryKey: ["cuisines"],
    queryFn: async () => {
      const response = await api.get("/cuisines");
      return response.data;
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
    ...options,
  });
};

export const useCreateCuisineMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (cuisineData) => {
      const response = await api.post("/cuisines", cuisineData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cuisines"] });
    },
  });
};

export const useUpdateCuisineMutation = (id) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (cuisineData) => {
      const response = await api.put(`/cuisines/${id}`, cuisineData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cuisines"] });
    },
  });
};

export const useDeleteCuisineMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      return api.delete(`/cuisines/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cuisines"] });
    },
  });
};

// ============= INGREDIENT HOOKS =============

export const useIngredientsQuery = (params = {}, options = {}) => {
  return useQuery({
    queryKey: ["ingredients", params],
    queryFn: async () => {
      const response = await api.get("/ingredients", { params });
      return response.data;
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
    ...options,
  });
};

export const useCreateIngredientMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (ingredientData) => {
      const response = await api.post("/ingredients", ingredientData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ingredients"] });
    },
  });
};

export const useUpdateIngredientMutation = (id) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (ingredientData) => {
      const response = await api.put(`/ingredients/${id}`, ingredientData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ingredients"] });
    },
  });
};

export const useDeleteIngredientMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      return api.delete(`/ingredients/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ingredients"] });
    },
  });
};

export const usePendingRecipesQuery = (options = {}) => {
  return useQuery({
    queryKey: ["pendingRecipes"],
    queryFn: async () => {
      const response = await api.get("/recipes/pending");
      return response.data;
    },
    staleTime: 30 * 60 * 1000,
    ...options,
  });
};

export const useAdminRecipeQuery = (id, options = {}) => {
  return useQuery({
    queryKey: ["adminRecipe", id],
    queryFn: async () => {
      const response = await api.get(`/recipes/${id}/draft`);
      return response.data;
    },
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
    ...options,
  });
};

export const useApproveRecipeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const response = await api.put(`/recipes/${id}/approve`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pendingRecipes"] });
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
      queryClient.invalidateQueries({ queryKey: ["ingredients"] });
    },
  });
};

export const useRejectRecipeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const response = await api.delete(`/recipes/${id}/reject`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pendingRecipes"] });
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
      queryClient.invalidateQueries({ queryKey: ["ingredients"] });
    },
  });
};

// ============= NOTIFICATION HOOKS =============

export const useNotificationsQuery = (options = {}) => {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const response = await api.get("/notifications");
      return response.data;
    },
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
    staleTime: 10 * 1000, // 10 seconds
    ...options,
  });
};

export const useUnreadCountQuery = (options = {}) => {
  return useQuery({
    queryKey: ["unreadCount"],
    queryFn: async () => {
      const response = await api.get("/notifications/unread-count");
      return response.data;
    },
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
    staleTime: 10 * 1000, // 10 seconds
    ...options,
  });
};

export const useMarkAsReadMutation = (notificationId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const response = await api.put(`/notifications/${notificationId}/read`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unreadCount"] });
    },
  });
};

export const useMarkAllAsReadMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const response = await api.put("/notifications/mark-all-read");
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unreadCount"] });
    },
  });
};

// ============= REPORT HOOKS =============

export const useReportsQuery = (options = {}) => {
  return useQuery({
    queryKey: ["reports"],
    queryFn: async () => {
      const response = await api.get("/reports");
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
};

export const useReportQuery = (reportId, options = {}) => {
  return useQuery({
    queryKey: ["report", reportId],
    queryFn: async () => {
      const response = await api.get(`/reports/${reportId}`);
      return response.data;
    },
    enabled: !!reportId,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useCreateReportMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (reportData) => {
      const response = await api.post("/reports", reportData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });
};

export const useUpdateReportMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...reportData }) => {
      console.log("Updating report with data:", reportData);
      const response = await api.put(`/reports/${id}`, reportData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });
};

// ============= SUBSCRIPTION HOOKS =============

export const useFollowUserMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId) => {
      const response = await api.post(`/subscriptions/${userId}`);
      return response.data;
    },
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: ["following"] });
      queryClient.invalidateQueries({ queryKey: ["profileFollowing", userId] });
      queryClient.invalidateQueries({
        queryKey: ["subscriptionStatus", userId],
      });
      queryClient.invalidateQueries({ queryKey: ["profileFollowers", userId] });
    },
  });
};

export const useUnfollowUserMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId) => {
      return api.delete(`/subscriptions/${userId}`);
    },
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: ["following"] });
      queryClient.invalidateQueries({ queryKey: ["profileFollowing", userId] });
      queryClient.invalidateQueries({
        queryKey: ["subscriptionStatus", userId],
      });
      queryClient.invalidateQueries({ queryKey: ["profileFollowers", userId] });
    },
  });
};

export const useProfileFollowersQuery = (userId, options = {}) => {
  return useQuery({
    queryKey: ["profileFollowers", userId],
    queryFn: async () => {
      const response = await api.get(`/subscriptions/followers/${userId}`);
      return response.data;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useProfileFollowingQuery = (userId, options = {}) => {
  return useQuery({
    queryKey: ["profileFollowing", userId],
    queryFn: async () => {
      const response = await api.get(`/subscriptions/user/${userId}`);
      return response.data;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useSubscriptionStatusQuery = (userId, options = {}) => {
  return useQuery({
    queryKey: ["subscriptionStatus", userId],
    queryFn: async () => {
      const response = await api.get(`/subscriptions/${userId}/status`);
      return response.data;
    },
    enabled: !!userId,
    staleTime: 0,
    ...options,
  });
};

export const useFollowersQuery = (userId, options = {}) => {
  return useQuery({
    queryKey: ["followers", userId],
    queryFn: async () => {
      const response = await api.get(`/subscriptions/followers/${userId}`);
      return response.data;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

export const useFollowingQuery = (userId, options = {}) => {
  return useQuery({
    queryKey: ["following", userId],
    queryFn: async () => {
      const response = await api.get(`/subscriptions/user/${userId}`);
      return response.data;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

// Legacy exports for backward compatibility (if needed during migration)
export const authService = {
  register: async (userData) => {
    const response = await api.post("/auth/register", userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post("/auth/login", credentials);
    if (response.data.accessToken) {
      localStorage.setItem("accessToken", response.data.accessToken);
      localStorage.setItem("refreshToken", response.data.refreshToken);
    }
    return response.data;
  },

  logout: async () => {
    return api.post("/auth/logout");
  },

  refresh: async (refreshToken) => {
    const response = await api.post("/auth/refresh", { refreshToken });
    if (response.data.accessToken) {
      localStorage.setItem("accessToken", response.data.accessToken);
      localStorage.setItem("refreshToken", response.data.refreshToken);
    }
    return response.data;
  },
};

export const commentService = {
  getComments: async (recipeId) => {
    const response = await api.get(`/recipes/${recipeId}/comments`);
    return response.data;
  },

  createComment: async (recipeId, commentData) => {
    const response = await api.post(
      `/recipes/${recipeId}/comments`,
      commentData,
    );
    return response.data;
  },

  updateComment: async (recipeId, commentId, commentData) => {
    const response = await api.put(
      `/recipes/${recipeId}/comments/${commentId}`,
      commentData,
    );
    return response.data;
  },

  deleteComment: async (recipeId, commentId) => {
    return api.delete(`/recipes/${recipeId}/comments/${commentId}`);
  },
};

export const recipeService = {
  getRecipes: async (params = {}) => {
    const response = await api.get("/recipes", { params });
    return response.data;
  },

  getRecipe: async (id) => {
    const response = await api.get(`/recipes/${id}`);
    return response.data;
  },

  getPopularRecipes: async () => {
    const response = await api.get("/recipes/popular");
    return response.data;
  },

  smartSearch: async (ingredientIds, page = 1, limit = 10) => {
    const params = {
      ingredientIds: Array.isArray(ingredientIds)
        ? ingredientIds.join(",")
        : ingredientIds,
      page,
      limit,
    };
    const response = await api.get("/recipes/smart-search", { params });
    return response.data;
  },

  createRecipe: async (formData) => {
    const response = await api.post("/recipes", formData);
    return response.data;
  },

  updateRecipe: async (id, data) => {
    const response = await api.put(`/recipes/${id}`, data);
    return response.data;
  },

  deleteRecipe: async (id) => {
    return api.delete(`/recipes/${id}`);
  },

  addToFavorites: async (id) => {
    const response = await api.post(`/recipes/${id}/favorites`);
    return response.data;
  },

  removeFromFavorites: async (id) => {
    return api.delete(`/recipes/${id}/favorites`);
  },

  approveRecipe: async (id) => {
    const response = await api.put(`/recipes/${id}/approve`);
    return response.data;
  },

  rejectRecipe: async (id) => {
    const response = await api.delete(`/recipes/${id}/reject`);
    return response.data;
  },

  markAsCooked: async (id) => {
    const response = await api.post(`/recipes/${id}/cooked`);
    return response.data;
  },
};

export const ingredientService = {
  getIngredients: async () => {
    const response = await api.get("/ingredients");
    return response.data;
  },

  getIngredient: async (id) => {
    const response = await api.get(`/ingredients/${id}`);
    return response.data;
  },

  createIngredient: async (data) => {
    const response = await api.post("/ingredients", data);
    return response.data;
  },

  updateIngredient: async (id, data) => {
    const response = await api.put(`/ingredients/${id}`, data);
    return response.data;
  },

  deleteIngredient: async (id) => {
    return api.delete(`/ingredients/${id}`);
  },
};
