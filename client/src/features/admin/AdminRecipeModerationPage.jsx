import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useRecipeQuery,
  useApproveRecipeMutation,
  useRejectRecipeMutation,
} from "../../services/apiService";
import {
  Card,
  CardContent,
  CardHeader,
  Button,
  Loader,
  Badge,
} from "../../components/ui";
import { SOCKET_URL } from "../../config/constants";
import "./AdminPanel.css";

export const AdminRecipeModerationPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: recipeData, isLoading } = useRecipeQuery(id);

  const approveMutation = useApproveRecipeMutation();
  const rejectMutation = useRejectRecipeMutation();

  useEffect(() => {
    if (approveMutation.isSuccess || rejectMutation.isSuccess) {
      navigate("/admin");
    }
  }, [approveMutation.isSuccess, rejectMutation.isSuccess, navigate]);

  if (isLoading) {
    return (
      <div className="loading-container">
        <Loader size="lg" />
      </div>
    );
  }

  const recipe = recipeData || null;

  if (!recipe) {
    return (
      <div className="recipe-not-found">
        <p>Recipe not found.</p>
        <Button onClick={() => navigate("/admin")}>Back</Button>
      </div>
    );
  }

  const newIngredients = (recipe.ingredients || []).filter(
    (ri) => ri.ingredient?.status === "NotVerified",
  );

  const newTags = (recipe.tags || []).filter(
    (t) => t?.status === "NotVerified",
  );

  return (
    <div className="recipe-detail admin-recipe-moderation">
      {/* Hero Image */}
      <div className="recipe-hero">
        <img
          src={`${SOCKET_URL}${recipe.preview_img_url}`}
          alt={recipe.title}
        />
      </div>

      {/* Header */}
      <div className="recipe-header">
        <div>
          <h1>{recipe.title}</h1>
          <p className="recipe-author">By {recipe.author?.name}</p>
        </div>
        <div className="recipe-actions">
          <Button
            variant="success"
            onClick={() => approveMutation.mutate(recipe.id)}
            disabled={approveMutation.isLoading}
          >
            Approve
          </Button>
          <Button
            variant="danger"
            onClick={() => rejectMutation.mutate(recipe.id)}
            disabled={rejectMutation.isLoading}
            style={{ marginLeft: "var(--spacing-sm)" }}
          >
            Reject
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/admin")}
            style={{ marginLeft: "var(--spacing-sm)" }}
          >
            Back
          </Button>
        </div>
      </div>

      {/* Info Cards */}
      <div className="recipe-info-cards">
        <Card>
          <CardContent>
            <div className="info-item">
              <span className="info-label">Difficulty</span>
              <Badge variant="primary">{recipe.difficulty}</Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="info-item">
              <span className="info-label">Cooking Time</span>
              <span className="info-value">⏱️ {recipe.cooking_time} min</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="info-item">
              <span className="info-label">Calories</span>
              <span className="info-value">
                🔥 {recipe.calories ?? "—"} cal
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Grid */}
      <div className="recipe-content-grid">
        <div className="recipe-main">
          <Card>
            <CardHeader>Description</CardHeader>
            <CardContent>
              <p>{recipe.description}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>Ingredients</CardHeader>
            <CardContent>
              <ul className="ingredients-list">
                {(recipe.ingredients || []).map((ing, idx) => (
                  <li key={idx}>
                    <span className="ingredient-name">
                      {ing.ingredient?.name}
                    </span>
                    <span className="ingredient-amount">
                      {ing.amount} {ing.unit}
                    </span>
                    {ing.ingredient?.status === "NotVerified" && (
                      <Badge variant="warning" style={{ marginLeft: 8 }}>
                        New
                      </Badge>
                    )}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>Cooking Steps</CardHeader>
            <CardContent>
              <ol className="steps-list">
                {(recipe.steps || []).map((step, idx) => (
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

        <div className="recipe-sidebar">
          <Card>
            <CardHeader>Summary</CardHeader>
            <CardContent>
              <div className="info-item">
                <span className="info-label">Status</span>
                <Badge variant="warning">{recipe.status}</Badge>
              </div>
              <div style={{ marginTop: "var(--spacing-sm)" }}>
                <strong>Tags:</strong>{" "}
                {(recipe.tags || []).map((t) => t.name).join(", ") || "—"}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminRecipeModerationPage;
