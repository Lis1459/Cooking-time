import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  usePopularRecipesQuery,
  useRecommendedRecipesQuery,
  useRecipesQuery,
} from "../services/apiService";
import { Badge, Button, Loader } from "../components/ui";
import RecipeCard from "../components/common/RecipeCard";
import "./HomePage.css";

import { SOCKET_URL } from "../config/constants";

// import { toast } from "sonner";

export const HomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { data: popularRecipes = [], isLoading: popularLoading } =
    usePopularRecipesQuery();
  const { data: recommendedData = {}, isLoading: recommendedLoading } =
    useRecommendedRecipesQuery({ enabled: isAuthenticated });
  const { data: recipesData = {}, isLoading: recipesLoading } = useRecipesQuery(
    {
      limit: 20,
    },
  );
  const recipes = recipesData.recipes || [];
  const recommendedRecipes = recommendedData.recipes || [];
  console.log("Recomended: ", recommendedRecipes);

  const loading = popularLoading || recipesLoading || recommendedLoading;

  if (loading) {
    return (
      <div className="home-page__loading">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="home-page__hero">
        <div className="home-page__hero-content">
          <h1>Добро пожаловать в Cooking Time</h1>
          <p>Открывайте, делитесь и готовьте вкусные рецепты со всего мира</p>
          <div className="home-page__hero-actions">
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate("/recipes")}
            >
              Просмотреть рецепты
            </Button>
            {isAuthenticated && (
              <Button
                variant="secondary"
                size="lg"
                onClick={() => navigate("/add-recipe")}
              >
                Создать рецепт
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Recommended Recipes Section */}
      {isAuthenticated && recommendedRecipes.length > 0 && (
        <section className="home-page__section">
          <h2>Рекомендовано для вас</h2>
          <div className="home-page__recipes-grid">
            {recommendedRecipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onView={() => navigate(`/recipes/${recipe.id}`)}
                className="home-page__recipe-card"
              />
            ))}
          </div>
        </section>
      )}

      {/* Popular Recipes Section */}
      <section className="home-page__section">
        <h2>Популярные рецепты недели</h2>
        <div className="home-page__recipes-grid">
          {(popularRecipes || []).map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onView={() => navigate(`/recipes/${recipe.id}`)}
              className="home-page__recipe-card"
            />
          ))}
        </div>
      </section>

      {/* Recent Recipes Section */}
      <section className="home-page__section">
        <h2>Последние рецепты</h2>
        <div className="home-page__recipes-grid">
          {recipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onView={() => navigate(`/recipes/${recipe.id}`)}
              className="home-page__recipe-card"
            />
          ))}
        </div>
      </section>

      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="home-page__cta-section">
          <h2>Готовы поделиться любимыми рецептами?</h2>
          <p>
            Присоединяйтесь к сообществу любителей еды и начните готовить вместе
          </p>
          <div className="home-page__cta-actions">
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate("/register")}
            >
              Зарегистрироваться бесплатно
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate("/recipes")}
            >
              Просмотреть рецепты
            </Button>
          </div>
        </section>
      )}
    </div>
  );
};

export default HomePage;
