import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useMyRecipesQuery } from "../services/apiService";
import { Card, CardContent, Button, Loader, Badge } from "../components/ui";
import "./MyRecipesPage.css";
import { SOCKET_URL } from "../config/constants";

export const MyRecipesPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);

  const queryParams = useMemo(() => ({ page, limit }), [page, limit]);

  const { data, isLoading } = useMyRecipesQuery(user?.id, queryParams, {
    enabled: !!user?.id,
  });

  const recipes = data?.recipes ?? [];

  if (isLoading) {
    return (
      <div className="my-recipes-page__loading">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="my-recipes-page">
      <div className="my-recipes-page__header">
        <div>
          <h1>Мои рецепты</h1>
          <p className="my-recipes-page__subtitle">Рецепты, созданные вамии</p>
        </div>
        <div className="my-recipes-page__pagination-controls">
          <label>
            Рецептов на страниценице
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
            >
              <option value={6}>6</option>
              <option value={12}>12</option>
              <option value={24}>24</option>
            </select>
          </label>
        </div>
      </div>

      {recipes.length > 0 ? (
        <div className="my-recipes-page__recipes-grid">
          {recipes.map((recipe) => (
            <Card key={recipe.id} className="my-recipes-page__recipe-card">
              <img
                src={`${SOCKET_URL}${recipe.preview_img_url}`}
                alt={recipe.title}
                className="my-recipes-page__recipe-image"
              />
              <CardContent>
                <h3>{recipe.title}</h3>
                <p className="my-recipes-page__recipe-description truncate-single-line">
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
                <div className="my-recipes-page__recipe-meta">
                  <div className="my-recipes-page__recipe-tags">
                    <Badge variant="primary">{recipe.difficulty}</Badge>
                    <Badge variant="success">{recipe.calories} cal</Badge>
                  </div>
                  <span className="my-recipes-page__cooking-time">
                    ⏱️ {recipe.cooking_time} min
                  </span>
                </div>
                <div className="my-recipes-page__actions">
                  <Button
                    variant="primary"
                    onClick={() => navigate(`/recipes/${recipe.id}`)}
                  >
                    Просмотр
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/edit-recipe/${recipe.id}`)}
                  >
                    Редактировать
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="my-recipes-page__empty-state">
          <p>Вы еще не создали ни одного рецепта.</p>
          <Button variant="primary" onClick={() => navigate("/add-recipe")}>
            Добавить рецептецепт
          </Button>
        </div>
      )}

      {data?.total > limit && (
        <div className="my-recipes-page__pagination-footer">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          >
            Назад
          </Button>
          <span>
            Страница {page} из {Math.ceil((data?.total || 0) / limit)}
          </span>
          <Button
            variant="outline"
            disabled={page >= Math.ceil((data?.total || 0) / limit)}
            onClick={() => setPage((prev) => prev + 1)}
          >
            Далеее
          </Button>
        </div>
      )}
    </div>
  );
};

export default MyRecipesPage;
