import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  usePopularRecipesQuery,
  useRecipesQuery,
} from "../services/apiService";
import { Card, CardContent, Badge, Button, Loader } from "../components/ui";
import "./HomePage.css";

import { SOCKET_URL } from "../config/constants";

// import { toast } from "sonner";

export const HomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { data: popularRecipes = [], isLoading: popularLoading } =
    usePopularRecipesQuery();
  const { data: recipes = [], isLoading: recipesLoading } = useRecipesQuery({
    limit: 6,
  });

  const loading = popularLoading || recipesLoading;

  if (loading) {
    return (
      <div className="loading-container">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Welcome to Cooking Time</h1>
          <p>
            Discover, share, and master delicious recipes from around the world
          </p>
          <div className="hero-actions">
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate("/recipes")}
            >
              Browse Recipes
            </Button>
            {isAuthenticated && (
              <Button
                variant="secondary"
                size="lg"
                onClick={() => navigate("/add-recipe")}
              >
                Create Recipe
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Popular Recipes Section */}
      <section className="section">
        <h2>Popular Recipes This Week</h2>
        <div className="recipes-grid">
          {(popularRecipes || []).slice(0, 6).map((recipe) => (
            <Card key={recipe.id} className="recipe-card">
              <img
                src={`${SOCKET_URL}${recipe.preview_img_url}`}
                alt={recipe.title}
                className="recipe-image"
              />
              <CardContent>
                <h3>{recipe.title}</h3>
                <p className="recipe-description">
                  {recipe.description.substring(0, 100)}...
                </p>
                <div className="recipe-info">
                  <Badge variant="primary">{recipe.difficulty}</Badge>
                  <span className="cooking-time">
                    ⏱️ {recipe.cooking_time}min
                  </span>
                </div>
                <Button
                  variant="outline"
                  style={{ width: "100%", marginTop: "var(--spacing-md)" }}
                  onClick={() => navigate(`/recipes/${recipe.id}`)}
                >
                  View Recipe
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Recent Recipes Section */}
      <section className="section">
        <h2>Latest Recipes</h2>
        {/* <div className="recipes-grid">
          {(recipes || []).slice(0, 6).map((recipe) => (
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
                <div className="recipe-info">
                  <Badge variant="success">{recipe.calories} cal</Badge>
                  <span className="cooking-time">
                    ⏱️ {recipe.cooking_time}min
                  </span>
                </div>
                <Button
                  variant="outline"
                  style={{ width: "100%", marginTop: "var(--spacing-md)" }}
                  onClick={() => navigate(`/recipes/${recipe.id}`)}
                >
                  View Recipe
                </Button>
              </CardContent>
            </Card>
          ))}
        </div> */}
      </section>

      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="cta-section">
          <h2>Ready to share your favorite recipes?</h2>
          <p>Join our community of food lovers and start cooking together</p>
          <div className="cta-actions">
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate("/register")}
            >
              Sign Up Free
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate("/recipes")}
            >
              Create Recipes
            </Button>
          </div>
        </section>
      )}
    </div>
  );
};

export default HomePage;
