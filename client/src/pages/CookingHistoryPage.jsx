import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useRecipesQuery, useMarkRecipeMutation } from "../services/apiService";
import { Card, CardContent, Button, Loader, Badge } from "../components/ui";
import "./CookingHistory.css";
import { SOCKET_URL } from "../config/constants";

export const CookingHistoryPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState("cooked");
  const [recipes, setRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const markRecipeMutation = useMarkRecipeMutation();

  // Fetch recipes with different statuses
  const { data: cookedData, isLoading: cookedLoading } = useRecipesQuery(
    {
      cookStatus: "COOKED",
      userId: user?.id,
    },
    { enabled: isAuthenticated && activeTab === "cooked" },
  );

  const { data: wantToCookData, isLoading: wantToCookLoading } =
    useRecipesQuery(
      {
        cookStatus: "TO_COOK",
        userId: user?.id,
      },
      { enabled: isAuthenticated && activeTab === "want-to-cook" },
    );

  useEffect(() => {
    if (activeTab === "cooked") {
      setRecipes(cookedData?.recipes || []);
      setIsLoading(cookedLoading);
    } else {
      setRecipes(wantToCookData?.recipes || []);
      setIsLoading(wantToCookLoading);
    }
  }, [activeTab, cookedData, cookedLoading, wantToCookData, wantToCookLoading]);

  const handleMarkAsCooked = async (recipeId) => {
    try {
      await markRecipeMutation.mutateAsync({
        id: recipeId,
        status: "COOKED",
      });
      // Remove from want-to-cook list
      setRecipes(recipes.filter((r) => r.id !== recipeId));
    } catch (error) {
      console.error("Failed to mark as cooked:", error);
    }
  };

  const handleRemoveFromList = async (recipeId) => {
    try {
      await markRecipeMutation.mutateAsync({
        id: recipeId,
        status: null,
      });
      // Remove from list
      setRecipes(recipes.filter((r) => r.id !== recipeId));
    } catch (error) {
      console.error("Failed to remove from list:", error);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="cooking-history-page">
        <h1>История приготовлений</h1>
        <div className="empty-state">
          <p>Пожалуйста, войдите в аккаунт</p>
          <Button onClick={() => navigate("/login")}>Войти</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="cooking-history-page">
      <h1>История приготовлений</h1>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === "cooked" ? "active" : ""}`}
          onClick={() => setActiveTab("cooked")}
        >
          Готовил
        </button>
        <button
          className={`tab ${activeTab === "want-to-cook" ? "active" : ""}`}
          onClick={() => setActiveTab("want-to-cook")}
        >
          Хочу приготовить
        </button>
      </div>

      {isLoading && (
        <div className="cooking-history__loading">
          <Loader size="lg" />
        </div>
      )}

      {/* Recipes Grid */}
      {!isLoading && recipes.length > 0 ? (
        <div className="cooking-history__recipes-grid">
          {recipes.map((recipe) => (
            <Card key={recipe.id} className="cooking-history__recipe-card">
              <div className="recipe-image-wrapper">
                <img
                  src={`${SOCKET_URL}${recipe.preview_img_url}`}
                  alt={recipe.title}
                  className="cooking-history__recipe-image"
                />
              </div>
              <CardContent>
                <h3>{recipe.title}</h3>
                <p className="cooking-history__recipe-description truncate-single-line">
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
                <div className="cooking-history__recipe-meta">
                  <div className="cooking-history__recipe-tags">
                    <Badge variant="primary">{recipe.difficulty}</Badge>
                    <Badge variant="success">{recipe.calories} ккал</Badge>
                  </div>
                  <span className="cooking-history__cooking-time">
                    ⏱️ {recipe.cooking_time} мин
                  </span>
                </div>

                {/* Actions */}
                <div className="cooking-history__actions">
                  <Button
                    variant="primary"
                    style={{ flex: 1 }}
                    onClick={() => navigate(`/recipes/${recipe.id}`)}
                  >
                    Просмотр
                  </Button>
                  {activeTab === "want-to-cook" && (
                    <>
                      <Button
                        variant="secondary"
                        onClick={() => handleMarkAsCooked(recipe.id)}
                      >
                        Приготовил
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => handleRemoveFromList(recipe.id)}
                      >
                        Удалить
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !isLoading && recipes.length === 0 ? (
        <div className="empty-state">
          <p>
            {activeTab === "cooked"
              ? "Вы еще ничего не готовили"
              : "Добавляйте рецепты в список"}
          </p>
          <Button onClick={() => navigate("/recipes")}>
            {activeTab === "cooked" ? "Перейти в каталог" : "Найти рецепты"}
          </Button>
        </div>
      ) : null}
    </div>
  );
};

export default CookingHistoryPage;
