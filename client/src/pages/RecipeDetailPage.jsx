import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../config/api";
import {
  useRecipeQuery,
  useAddToFavoritesMutation,
  useRemoveFromFavoritesMutation,
  useMarkRecipeMutation,
  useCommentsQuery,
  useCreateCommentMutation,
  useRateQuery,
  useRateRecipeMutation,
  useUpdateRecipeMutation,
  useDeleteRecipeMutation,
  useDeleteCommentMutation,
} from "../services/apiService";
import { useRecipeAverageQuery } from "../services/apiService";
import {
  Card,
  CardContent,
  CardHeader,
  Button,
  Textarea,
  Loader,
  Badge,
  Input,
  Select,
  Pagination,
} from "../components/ui";
import { ReportDialog } from "../components/common/ReportDialog";
import ConfirmDialog from "../components/common/ConfirmDialog";
import "./RecipeDetail.css";
import { SelectButton } from "../components/ui/selectButton/selectButton";
import { SOCKET_URL } from "../config/constants";

export const RecipeDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  console.log("user: ", user);
  const userId = { userId: user?.id };
  const { data: currentRecipe, isLoading } = useRecipeQuery(id, userId);

  const [currentPage, setCurrentPage] = useState(1);
  const limit = 3;

  const {
    data: commentsData,
    isLoading: loading_comments,
    refetch: refetchComments,
  } = useCommentsQuery(id, currentPage, limit);

  const { data: ratingData, isLoading: loading_rating } = useRateQuery(
    id,
    isAuthenticated,
  );
  const { data: avgRatingData } = useRecipeAverageQuery(id);

  const comments = commentsData ? commentsData.comments : [];
  const totalComments = commentsData ? commentsData.total : 0;
  const totalPages = Math.ceil(totalComments / limit);
  const addToFavsMutation = useAddToFavoritesMutation();
  const removeFromFavsMutation = useRemoveFromFavoritesMutation();
  const markRecipeMutation = useMarkRecipeMutation();
  const createCommentMutation = useCreateCommentMutation(id);
  const upsertRatingMutation = useRateRecipeMutation(id);

  const [commentText, setCommentText] = useState("");
  const [rating, setRating] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [cookMark, setCookMark] = useState(
    currentRecipe ? currentRecipe.cookMark : null,
  );
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportCommentDialogOpen, setReportCommentDialogOpen] = useState(false);
  const [selectedCommentId, setSelectedCommentId] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [hideModalOpen, setHideModalOpen] = useState(false);
  const [deleteCommentModalOpen, setDeleteCommentModalOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);

  const updateRecipeMutation = useUpdateRecipeMutation(id);
  const deleteRecipeMutation = useDeleteRecipeMutation(id);
  const deleteCommentMutation = useDeleteCommentMutation(
    id,
    commentToDelete?.id,
  );

  const isAdmin = user?.role === "ADMIN";

  useEffect(() => {
    if (currentRecipe) {
      console.log(currentRecipe.cookMark);
      setIsFavorite(currentRecipe.isFavorite);
      setCookMark(currentRecipe.cookMark || "");
      setRating(ratingData?.rating || 0);
    }
  }, [currentRecipe, ratingData]);

  useEffect(() => {
    const registerView = async () => {
      try {
        await api.post(`/recipes/${id}/view`);
      } catch (err) {
        console.error("Failed to register recipe view:", err);
      }
    };

    if (id) {
      registerView();
    }
  }, [id]);

  const handleAddComment = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (!commentText.trim()) return;

    createCommentMutation.mutate(
      { text: commentText },
      {
        onSuccess: () => {
          setCommentText("");
          setCurrentPage(1);
          refetchComments();
        },
      },
    );
  };

  const handleAddRating = async (score) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    setRating(score);
    const scoreData = { score };
    try {
      await upsertRatingMutation.mutateAsync(scoreData);
    } catch (err) {
      console.log("failed to update rating:", err);
    }
  };

  const handleDeleteRecipe = async () => {
    try {
      await deleteRecipeMutation.mutateAsync();
      navigate("/recipes");
    } catch (error) {
      console.error("Failed to delete recipe:", error);
    }
  };

  const handleDeleteComment = async () => {
    if (!commentToDelete) return;

    try {
      await deleteCommentMutation.mutateAsync();
      refetchComments();
      setDeleteCommentModalOpen(false);
      setCommentToDelete(null);
    } catch (error) {
      console.error("Failed to delete comment:", error);
    }
  };

  const handleToggleHideRecipe = async () => {
    const nextStatus =
      currentRecipe.status === "HIDDEN" ? "PUBLISHED" : "HIDDEN";

    try {
      await updateRecipeMutation.mutateAsync({ status: nextStatus });
      setHideModalOpen(false);
    } catch (error) {
      console.error("Failed to update recipe status:", error);
    }
  };

  const handleAddToFavorites = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    try {
      if (isFavorite) {
        await removeFromFavsMutation.mutateAsync(id);
      } else {
        await addToFavsMutation.mutateAsync(id);
      }
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error("Failed to update favorites:", error);
    }
  };

  const handleMarkRecipe = async (status) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    try {
      await markRecipeMutation.mutateAsync({ id, status });
      setCookMark(status);
    } catch (error) {
      console.error("Failed to mark as cooked:", error);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (isLoading) {
    return (
      <div className="recipe-detail__loading">
        <Loader size="lg" />
      </div>
    );
  }

  if (!currentRecipe) {
    return (
      <div className="recipe-not-found">
        <p>Рецепт не найден.</p>
        <Button onClick={() => navigate("/recipes")}>Назад к рецептам</Button>
      </div>
    );
  }

  return (
    <div className="recipe-detail">
      {/* Hero Image */}
      <div className="recipe-hero">
        <img
          src={`${SOCKET_URL}${currentRecipe.preview_img_url}`}
          alt={currentRecipe.title}
        />
      </div>

      {/* Header */}
      <div className="recipe-header">
        <div>
          <h1>{currentRecipe.title}</h1>
          {avgRatingData && (
            <div style={{ marginTop: "6px" }} className="recipe-card__rating">
              ⭐{" "}
              {typeof avgRatingData.average === "number"
                ? avgRatingData.average.toFixed(1)
                : avgRatingData.average}
              {avgRatingData.total ? ` (${avgRatingData.total})` : ""}
            </div>
          )}
          <p className="recipe-author">
            Автор:{" "}
            {currentRecipe.author?.name ? (
              <Link to={`/profile/${currentRecipe.author_id}`}>
                {currentRecipe.author.name}
              </Link>
            ) : (
              "Неизвестен"
            )}
          </p>
        </div>
        <div className="recipe-actions">
          {(user?.id === currentRecipe.author_id || isAdmin) && (
            <Button
              variant="outline"
              onClick={() => navigate(`/edit-recipe/${id}`)}
            >
              Редактировать
            </Button>
          )}
          {(isAdmin || user?.id === currentRecipe.author_id) && (
            <>
              <Button
                variant="danger"
                onClick={() => setDeleteModalOpen(true)}
                disabled={deleteRecipeMutation.isLoading}
              >
                Удалить
              </Button>
              <Button
                variant="outline"
                onClick={() => setHideModalOpen(true)}
                disabled={updateRecipeMutation.isLoading}
              >
                {currentRecipe.status === "HIDDEN" ? "Показать" : "Скрыть"}
              </Button>
            </>
          )}
          {isAuthenticated && user?.id !== currentRecipe.author_id && (
            <Button
              variant="outline"
              onClick={() => setReportDialogOpen(true)}
              title="Пожаловаться на этот рецепт"
            >
              ⚠️ Пожаловаться
            </Button>
          )}
          <Button
            variant={isFavorite ? "primary" : "outline"}
            onClick={handleAddToFavorites}
          >
            {isFavorite ? "❤️ Сохранено" : "🤍 Сохранить"}
          </Button>
          {/* <Button variant="primary" onClick={() => handleMarkRecipe("COOKED")}>
            ✓ Приготовлено
          </Button> */}
          <SelectButton
            value={cookMark}
            options={[
              { label: "Хочу приготовить", value: "TO_COOK" },
              { label: "Приготовлено", value: "COOKED" },
            ]}
            onChange={(value) => handleMarkRecipe(value)}
          />
        </div>
      </div>

      {/* Info Cards */}
      <div className="recipe-info-cards">
        <Card>
          <CardContent>
            <div className="info-item">
              <span className="info-label">Сложность</span>
              <Badge variant="primary">{currentRecipe.difficulty}</Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="info-item">
              <span className="info-label">Время приготовления</span>
              <span className="info-value">
                ⏱️ {currentRecipe.cooking_time} мин
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="info-item">
              <span className="info-label">Калории</span>
              <span className="info-value">
                🔥 {currentRecipe.calories} cal
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Grid */}
      <div className="recipe-content-grid">
        {/* Left Column - Ingredients & Steps */}
        <div className="recipe-main">
          {/* Description */}
          <Card>
            <CardHeader>Описание</CardHeader>
            <CardContent>
              <p>{currentRecipe.description}</p>
            </CardContent>
          </Card>

          {/* Ingredients */}
          <Card>
            <CardHeader>Ингредиенты</CardHeader>
            <CardContent>
              <ul className="ingredients-list">
                {(currentRecipe.ingredients || []).map((ing, idx) => (
                  <li key={idx}>
                    <span className="ingredient-name">
                      {ing.ingredient?.name}
                    </span>
                    <span className="ingredient-amount">
                      {ing.amount} {ing.unit}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Steps */}
          <Card>
            <CardHeader>Этапы приготовления</CardHeader>
            <CardContent>
              <ol className="steps-list">
                {(currentRecipe.steps || []).map((step, idx) => (
                  <li key={idx}>
                    {step.image_url && (
                      <img src={step.image_url} alt={`Step ${idx + 1}`} />
                    )}
                    <p>{step.description}</p>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Comments & Rating */}
        <div className="recipe-sidebar">
          {/* Rating */}
          <Card>
            <CardHeader>Оцените рецепт</CardHeader>
            <CardContent>
              <div className="rating-selector">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    className={`star ${rating >= star ? "active" : ""}`}
                    onClick={() => handleAddRating(star)}
                  >
                    ⭐
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="rating-display">Ваша оценка: {rating}/5</p>
              )}
            </CardContent>
          </Card>

          {/* Comments */}
          <Card className="comments-card">
            <CardHeader>Comments ({totalComments})</CardHeader>
            <CardContent>
              {isAuthenticated && (
                <div className="add-comment">
                  <Textarea
                    placeholder="Поделитесь впечатлениями..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    rows={3}
                  />
                  <Button
                    style={{ marginTop: "var(--spacing-md)" }}
                    onClick={handleAddComment}
                  >
                    Добавить комментарий
                  </Button>
                </div>
              )}

              {!isAuthenticated && (
                <p className="login-prompt">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate("/login")}
                  >
                    Войти
                  </Button>{" "}
                  чтобы добавить комментарии
                </p>
              )}

              <div className="comments-list">
                {loading_comments ? (
                  <Loader size="md" />
                ) : comments.length > 0 ? (
                  comments.map((comment) => (
                    <div key={comment.id} className="comment-item">
                      <div className="comment-header">
                        <div className="comment-author">
                          <strong>{comment.user?.name}</strong>
                          <span className="comment-date">
                            {new Date(comment.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="comment-actions">
                          {isAuthenticated &&
                            (user?.id === comment.user_id || isAdmin) && (
                              <button
                                className="comment-delete-btn"
                                onClick={() => {
                                  setCommentToDelete(comment);
                                  setDeleteCommentModalOpen(true);
                                }}
                                title="Удалить комментарий"
                              >
                                🗑️
                              </button>
                            )}
                          {isAuthenticated && user?.id !== comment.user_id && (
                            <button
                              className="comment-report-btn"
                              onClick={() => {
                                setSelectedCommentId(comment.id);
                                setReportCommentDialogOpen(true);
                              }}
                              title="Пожаловаться на этот комментарий"
                            >
                              ⚠️
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="comment-text">{comment.text}</p>
                    </div>
                  ))
                ) : (
                  <p className="no-comments">
                    Комментариев пока нет. Будьте первым!
                  </p>
                )}
              </div>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                className="comments-pagination"
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Report Dialogs */}
      <ReportDialog
        isOpen={reportDialogOpen}
        onClose={() => setReportDialogOpen(false)}
        targetType="RECIPE"
        targetId={id}
      />
      <ReportDialog
        isOpen={reportCommentDialogOpen}
        onClose={() => {
          setReportCommentDialogOpen(false);
          setSelectedCommentId(null);
        }}
        targetType="COMMENT"
        targetId={selectedCommentId}
      />

      <ConfirmDialog
        isOpen={deleteModalOpen}
        title="Подтвердите удаление"
        message="Вы уверены, что хотите удалить этот рецепт? Это действие нельзя отменить."
        onCancel={() => setDeleteModalOpen(false)}
        onConfirm={async () => {
          await handleDeleteRecipe();
          setDeleteModalOpen(false);
        }}
        loading={deleteRecipeMutation.isLoading}
        confirmLabel="Удалить"
      />

      <ConfirmDialog
        isOpen={hideModalOpen}
        title={
          currentRecipe.status === "HIDDEN"
            ? "Показать рецепт"
            : "Скрыть рецепт"
        }
        message={
          currentRecipe.status === "HIDDEN"
            ? "Этот рецепт снова станет видимым для пользователей."
            : "Этот рецепт будет скрыт из публичного списка."
        }
        onCancel={() => setHideModalOpen(false)}
        onConfirm={async () => {
          await handleToggleHideRecipe();
        }}
        loading={updateRecipeMutation.isLoading}
        confirmLabel={currentRecipe.status === "HIDDEN" ? "Показать" : "Скрыть"}
      />

      <ConfirmDialog
        isOpen={deleteCommentModalOpen}
        title="Подтвердите удаление комментария"
        message="Вы уверены, что хотите удалить этот комментарий? Это действие нельзя отменить."
        onCancel={() => {
          setDeleteCommentModalOpen(false);
          setCommentToDelete(null);
        }}
        onConfirm={handleDeleteComment}
        loading={deleteCommentMutation.isLoading}
        confirmLabel="Удалить"
      />
    </div>
  );
};

export default RecipeDetailPage;
