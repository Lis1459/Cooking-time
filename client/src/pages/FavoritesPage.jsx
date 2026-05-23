import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import {
  useRecipesQuery,
  useRemoveFromFavoritesMutation,
} from "../services/apiService";
import { Card, CardContent, Button, Loader, Badge } from "../components/ui";
import "./Favorites.css";
import { SOCKET_URL } from "../config/constants";

export const FavoritesPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: recipeData, isLoading } = useRecipesQuery({
    isFavorite: true,
    userId: user?.id,
  });
  const recipes = recipeData?.recipes ?? [];

  console.log(recipes);
  const removeFromFavsMutation = useRemoveFromFavoritesMutation();
  const [favorites, setFavorites] = useState([]);

  const handleRemoveFavorite = async (recipeId) => {
    removeFromFavsMutation.mutate(recipeId, {
      onSuccess: () => {
        setFavorites(favorites.filter((f) => f.id !== recipeId));
      },
    });
  };

  if (isLoading) {
    return (
      <div className="favorites-page__loading">
        <Loader size="lg" />
      </div>
    );
  }

  const displayRecipes = recipes.length > 0 ? recipes : favorites;

  return (
    <div className="favorites-page">
      <h1>Избранные рецепты</h1>

      {displayRecipes.length > 0 ? (
        <div className="favorites-page__recipes-grid">
          {displayRecipes.map((recipe) => (
            <Card key={recipe.id} className="favorites-page__recipe-card">
              <img
                src={`${SOCKET_URL}${recipe.preview_img_url}`}
                alt={recipe.title}
                className="favorites-page__recipe-image"
              />
              <CardContent>
                <h3>{recipe.title}</h3>
                <p className="favorites-page__recipe-description truncate-single-line">
                  {recipe.description}
                </p>
                {(() => {
                  const avg =
                    recipe.rating?.average ??
                    recipe.avgRating ??
                    recipe.average_rating ??
                    recipe.averageRating ??
                    recipe.rating;
                  return avg ? (
                    <div
                      className="recipe-card__rating"
                      style={{ marginTop: 6 }}
                    >
                      ⭐ {typeof avg === "number" ? avg.toFixed(1) : avg}
                    </div>
                  ) : null;
                })()}
                <div className="favorites-page__recipe-meta">
                  <Badge variant="primary">{recipe.difficulty}</Badge>
                  <span className="favorites-page__cooking-time">
                    ⏱️ {recipe.cooking_time} мин
                  </span>
                </div>
                <div className="favorites-page__actions">
                  <Button
                    variant="primary"
                    style={{ flex: 1 }}
                    onClick={() => navigate(`/recipes/${recipe.id}`)}
                  >
                    Просмотр
                  </Button>
                  {/* <Button
                    variant="danger"
                    onClick={() => handleRemoveFavorite(recipe.id)}
                  >
                    Remove
                  </Button> */}
                </div>
              </CardContent>
            </Card>
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
