import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  useRecipeQuery,
  useAddToFavoritesMutation,
  useRemoveFromFavoritesMutation,
  useMarkRecipeMutation,
  useCommentsQuery,
  useCreateCommentMutation,
  useRateQuery,
  useRateRecipeMutation,
} from "../services/apiService";
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
import "./RecipeDetail.css";
import { SelectButton } from "../components/ui/selectButton/selectButton";
import { SOCKET_URL } from "../config/constants";

export const RecipeDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
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

  useEffect(() => {
    if (currentRecipe) {
      console.log(currentRecipe.cookMark);
      setIsFavorite(currentRecipe.isFavorite);
      setCookMark(currentRecipe.cookMark || "");
      setRating(ratingData?.rating || 0);
    }
  }, [currentRecipe, ratingData]);

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
        <p>Recipe not found.</p>
        <Button onClick={() => navigate("/recipes")}>Back to Recipes</Button>
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
          <p className="recipe-author">By {currentRecipe.author?.name}</p>
        </div>
        <div className="recipe-actions">
          {user?.id === currentRecipe.author_id && (
            <Button
              variant="outline"
              onClick={() => navigate(`/edit-recipe/${id}`)}
            >
              Edit
            </Button>
          )}
          <Button
            variant={isFavorite ? "primary" : "outline"}
            onClick={handleAddToFavorites}
          >
            {isFavorite ? "❤️ Saved" : "🤍 Save"}
          </Button>
          {/* <Button variant="primary" onClick={() => handleMarkRecipe("COOKED")}>
            ✓ Cooked
          </Button> */}
          <SelectButton
            value={cookMark}
            options={[
              { label: "Want to cook", value: "TO_COOK" },
              { label: "Cooked", value: "COOKED" },
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
              <span className="info-label">Difficulty</span>
              <Badge variant="primary">{currentRecipe.difficulty}</Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="info-item">
              <span className="info-label">Cooking Time</span>
              <span className="info-value">
                ⏱️ {currentRecipe.cooking_time} min
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="info-item">
              <span className="info-label">Calories</span>
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
            <CardHeader>Description</CardHeader>
            <CardContent>
              <p>{currentRecipe.description}</p>
            </CardContent>
          </Card>

          {/* Ingredients */}
          <Card>
            <CardHeader>Ingredients</CardHeader>
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
            <CardHeader>Cooking Steps</CardHeader>
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
            <CardHeader>Rate This Recipe</CardHeader>
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
                <p className="rating-display">Your rating: {rating}/5</p>
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
                    placeholder="Share your thoughts..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    rows={3}
                  />
                  <Button
                    style={{ marginTop: "var(--spacing-md)" }}
                    onClick={handleAddComment}
                  >
                    Add Comment
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
                    Sign in
                  </Button>{" "}
                  to add comments
                </p>
              )}

              <div className="comments-list">
                {loading_comments ? (
                  <Loader size="md" />
                ) : comments.length > 0 ? (
                  comments.map((comment) => (
                    <div key={comment.id} className="comment-item">
                      <div className="comment-author">
                        <strong>{comment.user?.name}</strong>
                        <span className="comment-date">
                          {new Date(comment.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="comment-text">{comment.text}</p>
                    </div>
                  ))
                ) : (
                  <p className="no-comments">No comments yet. Be the first!</p>
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
    </div>
  );
};

export default RecipeDetailPage;
