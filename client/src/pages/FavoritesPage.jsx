import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  useRecipesQuery,
  useRemoveFromFavoritesMutation,
} from "../services/apiService";
import { Card, CardContent, Button, Loader, Badge } from "../components/ui";
import "./Favorites.css";

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
      <div className="loading-container">
        <Loader size="lg" />
      </div>
    );
  }

  const displayRecipes = recipes.length > 0 ? recipes : favorites;

  return (
    <div className="favorites-page">
      <h1>My Favorite Recipes</h1>

      {displayRecipes.length > 0 ? (
        <div className="recipes-grid">
          {displayRecipes.map((recipe) => (
            <Card key={recipe.id} className="recipe-card">
              <img
                src={recipe.preview_img_url}
                alt={recipe.title}
                className="recipe-image"
              />
              <CardContent>
                <h3>{recipe.title}</h3>
                <p className="recipe-description">
                  {recipe.description.substring(0, 100)}...
                </p>
                <div className="recipe-meta">
                  <Badge variant="primary">{recipe.difficulty}</Badge>
                  <span className="cooking-time">
                    ⏱️ {recipe.cooking_time}min
                  </span>
                </div>
                <div className="recipe-actions">
                  <Button
                    variant="primary"
                    style={{ flex: 1 }}
                    onClick={() => navigate(`/recipes/${recipe.id}`)}
                  >
                    View
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => handleRemoveFavorite(recipe.id)}
                  >
                    Remove
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p>No favorite recipes yet.</p>
          <Button onClick={() => navigate("/recipes")}>Browse Recipes</Button>
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;
