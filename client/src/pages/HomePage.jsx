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

  console.log(popularRecipes);

  const loading = popularLoading || recipesLoading;

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

      {/* Popular Recipes Section */}
      <section className="home-page__section">
        <h2>Популярные рецепты недели</h2>
        <div className="home-page__recipes-grid">
          {(popularRecipes || []).slice(0, 6).map((recipe) => (
            <Card key={recipe.id} className="home-page__recipe-card">
              <img
                src={`${SOCKET_URL}${recipe.preview_img_url}`}
                alt={recipe.title}
                className="home-page__recipe-image"
              />
              <CardContent>
                <h3>{recipe.title}</h3>
                <p className="home-page__recipe-description truncate-single-line">
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
                <div className="home-page__recipe-info">
                  <Badge variant="primary">{recipe.difficulty}</Badge>
                  <span className="home-page__cooking-time">
                    ⏱️ {recipe.cooking_time} мин
                  </span>
                </div>
                <Button
                  variant="outline"
                  style={{ width: "100%", marginTop: "var(--spacing-md)" }}
                  onClick={() => navigate(`/recipes/${recipe.id}`)}
                >
                  Смотреть рецепт
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Recent Recipes Section */}
      <section className="home-page__section">
        <h2>Последние рецепты</h2>
        {/* <div className="home-page__recipes-grid">
          {(recipes || []).slice(0, 6).map((recipe) => (
            <Card key={recipe.id} className="home-page__recipe-card">
              <img
                src={recipe.preview_img_url}
                alt={recipe.title}
                className="home-page__recipe-image"
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
