import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  useRecipesQuery,
  useMarkRecipeMutation,
  useRemoveCookStatusMutation,
} from "../services/apiService";
import { Button, Loader } from "../components/ui";
import RecipeCard from "../components/common/RecipeCard";
import "./CookingHistory.css";

export const CookingHistoryPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState("cooked");

  const markRecipeMutation = useMarkRecipeMutation();
  const removeCookStatusMutation = useRemoveCookStatusMutation();

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

  const recipes =
    activeTab === "cooked"
      ? cookedData?.recipes || []
      : wantToCookData?.recipes || [];
  const isLoading = activeTab === "cooked" ? cookedLoading : wantToCookLoading;

  const handleMarkAsCooked = async (recipeId) => {
    try {
      await markRecipeMutation.mutateAsync({
        id: recipeId,
        status: "COOKED",
      });
    } catch (error) {
      console.error("Failed to mark as cooked:", error);
    }
  };

  const handleRemoveFromList = async (recipeId) => {
    try {
      await removeCookStatusMutation.mutateAsync(recipeId);
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
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              className="cooking-history__recipe-card"
              onView={() => navigate(`/recipes/${recipe.id}`)}
              actions={
                <>
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
                </>
              }
            />
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
