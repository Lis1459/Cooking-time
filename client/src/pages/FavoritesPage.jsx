import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import {
  useRecipesQuery,
  useRemoveFromFavoritesMutation,
} from "../services/apiService";
import { Button, Loader } from "../components/ui";
import RecipeCard from "../components/common/RecipeCard";
import "./Favorites.css";

export const FavoritesPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: recipeData, isLoading } = useRecipesQuery({
    isFavorite: true,
    userId: user?.id,
  });
  const recipes = recipeData?.recipes ?? [];
  console.log("favorites recipes: ", recipes);
  const removeFromFavsMutation = useRemoveFromFavoritesMutation();
  const handleRemoveFavorite = async (recipeId) => {
    removeFromFavsMutation.mutate(recipeId);
  };

  if (isLoading) {
    return (
      <div className="favorites-page__loading">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="favorites-page">
      <h1>Избранные рецепты</h1>

      {recipes.length > 0 ? (
        <div className="favorites-page__recipes-grid">
          {recipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onView={() => navigate(`/recipes/${recipe.id}`)}
              className="favorites-page__recipe-card"
            />
          ))}
        </div>
      ) : (
        <div className="favorites-page__empty-state">
          <p>No favorite recipes yet.</p>
          <Button onClick={() => navigate("/recipes")}>Browse Recipes</Button>
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;
