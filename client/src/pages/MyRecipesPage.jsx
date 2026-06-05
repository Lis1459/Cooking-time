import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  useMyRecipesQuery,
  useUpdateRecipeMutation,
  useDeleteRecipeMutation,
} from "../services/apiService";
import { Card, CardContent, Button, Loader, Badge } from "../components/ui";
import { Dropdown } from "../components/ui/dropdownMenu/DropdownMenu";
import ConfirmDialog from "../components/common/ConfirmDialog";
import "./MyRecipesPage.css";
import { SOCKET_URL } from "../config/constants";
import { RecipeDifficulty } from "../utils/recipeConst";
import ClockIcon from "./../assets/icons/ClockIcon";

export const MyRecipesPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [hideModalOpen, setHideModalOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  const queryParams = useMemo(() => ({ page, limit }), [page, limit]);

  const { data, isLoading, refetch } = useMyRecipesQuery(
    user?.id,
    queryParams,
    {
      enabled: !!user?.id,
    },
  );

  const recipes = data?.recipes ?? [];

  const deleteRecipeMutation = useDeleteRecipeMutation(selectedRecipe?.id);
  const updateRecipeMutation = useUpdateRecipeMutation(selectedRecipe?.id);

  const handleDeleteRecipe = async () => {
    try {
      await deleteRecipeMutation.mutateAsync();
      setDeleteModalOpen(false);
      setSelectedRecipe(null);
      refetch();
    } catch (error) {
      console.error("Failed to delete recipe:", error);
    }
  };

  const handleToggleHideRecipe = async () => {
    const nextStatus =
      selectedRecipe.status === "HIDDEN" ? "PUBLISHED" : "HIDDEN";

    try {
      await updateRecipeMutation.mutateAsync({ status: nextStatus });
      setHideModalOpen(false);
      setSelectedRecipe(null);
      refetch();
    } catch (error) {
      console.error("Failed to update recipe status:", error);
    }
  };

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
            Рецептов на странице
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
            >
              <option value={8}>8</option>
              <option value={16}>16</option>
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
                <h3 className="truncate-single-line">{recipe.title}</h3>
                <p className="my-recipes-page__recipe-description truncate-single-line">
                  {recipe.description}
                </p>
                {(() => {
                  const avg = recipe.rating?.average;

                  return avg ? (
                    <div className="recipe-card__rating">
                      ⭐ {typeof avg === "number" ? avg.toFixed(1) : avg}
                    </div>
                  ) : (
                    <div className="recipe-card__rating">Нет оценок</div>
                  );
                })()}
                <div className="my-recipes-page__recipe-meta">
                  <div className="my-recipes-page__recipe-tags">
                    <Badge variant="primary">
                      {RecipeDifficulty[recipe.difficulty]}
                    </Badge>
                    <Badge variant="success">{recipe.calories} ккал</Badge>
                  </div>
                  <span className="my-recipes-page__cooking-time">
                    <ClockIcon /> {recipe.cooking_time} мин
                  </span>
                </div>
                <div className="my-recipes-page__actions">
                  <Button
                    variant="primary"
                    onClick={() => navigate(`/recipes/${recipe.id}`)}
                  >
                    Просмотр
                  </Button>
                  <Dropdown
                    trigger={
                      <button
                        type="button"
                        className="recipe-actions-trigger"
                        aria-label="Дополнительные действия"
                      >
                        ⋮
                      </button>
                    }
                    items={[
                      {
                        label: "Редактировать",
                        // icon: "✏️",
                        onClick: () => navigate(`/edit-recipe/${recipe.id}`),
                      },
                      {
                        label:
                          recipe.status === "HIDDEN" ? "Показать" : "Скрыть",
                        // icon: "👁️",
                        onClick: () => {
                          setSelectedRecipe(recipe);
                          setHideModalOpen(true);
                        },
                      },
                      {
                        label: "Удалить",
                        // icon: "🗑️",
                        onClick: () => {
                          setSelectedRecipe(recipe);
                          setDeleteModalOpen(true);
                        },
                        variant: "danger",
                      },
                    ]}
                  />
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

      <ConfirmDialog
        isOpen={deleteModalOpen}
        title="Подтвердите удаление"
        message="Вы уверены, что хотите удалить этот рецепт? Это действие нельзя отменить."
        onCancel={() => {
          setDeleteModalOpen(false);
          setSelectedRecipe(null);
        }}
        onConfirm={handleDeleteRecipe}
        loading={deleteRecipeMutation.isLoading}
        confirmLabel="Удалить"
      />

      <ConfirmDialog
        isOpen={hideModalOpen}
        title={
          selectedRecipe?.status === "HIDDEN"
            ? "Показать рецепт"
            : "Скрыть рецепт"
        }
        message={
          selectedRecipe?.status === "HIDDEN"
            ? "Этот рецепт снова станет видимым для пользователей."
            : "Этот рецепт будет скрыт из публичного списка."
        }
        onCancel={() => {
          setHideModalOpen(false);
          setSelectedRecipe(null);
        }}
        onConfirm={handleToggleHideRecipe}
        loading={updateRecipeMutation.isLoading}
        confirmLabel={
          selectedRecipe?.status === "HIDDEN" ? "Показать" : "Скрыть"
        }
      />
    </div>
  );
};

export default MyRecipesPage;
