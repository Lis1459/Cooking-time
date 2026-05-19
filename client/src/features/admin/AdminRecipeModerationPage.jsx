import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useAdminRecipeQuery,
  useApproveRecipeMutation,
  useRejectRecipeMutation,
  useCategoriesQuery,
  useTagsQuery,
  useCuisinesQuery,
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

const createLookup = (items) =>
  items.reduce((map, item) => {
    map[item.id] = item.name;
    return map;
  }, {});

export const AdminRecipeModerationPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: recipeData, isLoading } = useAdminRecipeQuery(id);
  const { data: categories = [] } = useCategoriesQuery();
  const { data: tags = [] } = useTagsQuery();
  const { data: cuisines = [] } = useCuisinesQuery();

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

  const categoryMap = createLookup(categories);
  const tagMap = createLookup(tags);
  const cuisineMap = createLookup(cuisines);

  const draft = recipe.draft;
  const draftData = draft?.data || {};
  const isEditPending = Boolean(draft);
  const draftEditor = draft?.editor?.name;

  const previewRecipe = {
    ...recipe,
    title: draftData.title ?? recipe.title,
    description: draftData.description ?? recipe.description,
    cooking_time: draftData.cooking_time ?? recipe.cooking_time,
    calories: draftData.calories ?? recipe.calories,
    difficulty: draftData.difficulty ?? recipe.difficulty,
    preview_img_url: draftData.preview_img_url ?? recipe.preview_img_url,
    categories: draftData.categories
      ? draftData.categories.map((id) => ({
          id: Number(id),
          name: categoryMap[Number(id)] || `#${id}`,
        }))
      : recipe.categories || [],
    tags: draftData.tags
      ? draftData.tags.map((id) => ({
          id: Number(id),
          name: tagMap[Number(id)] || `#${id}`,
        }))
      : recipe.tags || [],
    cuisines: draftData.cuisines
      ? draftData.cuisines.map((id) => ({
          id: Number(id),
          name: cuisineMap[Number(id)] || `#${id}`,
        }))
      : recipe.cuisines || [],
    ingredients: draftData.ingredients
      ? JSON.parse(draftData.ingredients).map((ing) => ({
          ingredient: {
            id: ing.ingredient_id ? Number(ing.ingredient_id) : null,
            name: ing.ingredient_name,
            status: ing.ingredient_id ? undefined : "NotVerified",
          },
          amount: Number(ing.amount),
          unit: ing.unit,
        }))
      : recipe.ingredients || [],
    steps: draftData.steps
      ? draftData.steps.create.map((step) => ({
          description: step.description,
          step_number: Number(step.step_number),
          image_url: step.image_url,
        }))
      : recipe.steps || [],
  };

  const draftIngredients = draftData.ingredients
    ? JSON.parse(draftData.ingredients).map((ing) => ({
        id: ing.ingredient_id ? Number(ing.ingredient_id) : null,
        name: ing.ingredient_name,
        amount: Number(ing.amount),
        unit: ing.unit,
      }))
    : [];

  const recipeIngredients = (recipe.ingredients || []).map((ing) => ({
    id: ing.ingredient?.id ?? null,
    name: ing.ingredient?.name,
    amount: Number(ing.amount),
    unit: ing.unit,
  }));

  const draftSteps = draftData.steps
    ? draftData.steps.create.map((step) => ({
        step_number: Number(step.step_number),
        description: step.description,
        image_url: step.image_url,
      }))
    : [];

  const recipeSteps = (recipe.steps || []).map((step) => ({
    step_number: Number(step.step_number),
    description: step.description,
    image_url: step.image_url,
  }));

  const isChanged = {
    title: Boolean(draftData.title && draftData.title !== recipe.title),
    description: Boolean(
      draftData.description && draftData.description !== recipe.description,
    ),
    cooking_time:
      Boolean(draftData.cooking_time) &&
      Number(draftData.cooking_time) !== recipe.cooking_time,
    calories:
      Boolean(draftData.calories) &&
      Number(draftData.calories) !== recipe.calories,
    difficulty: Boolean(
      draftData.difficulty && draftData.difficulty !== recipe.difficulty,
    ),
    image: Boolean(
      draftData.preview_img_url &&
      draftData.preview_img_url !== recipe.preview_img_url,
    ),
    categories:
      Boolean(draftData.categories) &&
      JSON.stringify(draftData.categories.map(Number).sort()) !==
        JSON.stringify((recipe.categories || []).map((c) => c.id).sort()),
    tags:
      Boolean(draftData.tags) &&
      JSON.stringify(draftData.tags.map(Number).sort()) !==
        JSON.stringify((recipe.tags || []).map((t) => t.id).sort()),
    cuisines:
      Boolean(draftData.cuisines) &&
      JSON.stringify(draftData.cuisines.map(Number).sort()) !==
        JSON.stringify((recipe.cuisines || []).map((c) => c.id).sort()),
    ingredients:
      draftIngredients.length > 0 &&
      JSON.stringify(recipeIngredients) !== JSON.stringify(draftIngredients),
    steps:
      draftSteps.length > 0 &&
      JSON.stringify(recipeSteps) !== JSON.stringify(draftSteps),
  };

  const heroImage = previewRecipe.preview_img_url
    ? `${SOCKET_URL}${previewRecipe.preview_img_url}`
    : null;

  return (
    <div className="recipe-detail admin-recipe-moderation">
      <div className="recipe-hero">
        {heroImage ? (
          <img src={heroImage} alt={previewRecipe.title} />
        ) : (
          <div className="recipe-hero-placeholder">No image</div>
        )}
      </div>

      <div className="recipe-header">
        <div>
          <h1>
            {previewRecipe.title}
            {isChanged.title && (
              <Badge variant="secondary" style={{ marginLeft: 8 }}>
                Changed
              </Badge>
            )}
          </h1>
          <p className="recipe-author">By {recipe.author?.name}</p>
          {isEditPending && (
            <Badge variant="secondary" style={{ marginTop: 8 }}>
              Update pending
            </Badge>
          )}
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
          >
            Reject
          </Button>
          <Button variant="outline" onClick={() => navigate("/admin")}>
            Back
          </Button>
        </div>
      </div>

      <div className="recipe-info-cards">
        <Card className={isChanged.difficulty ? "changed-section" : ""}>
          <CardContent>
            <div className="info-item">
              <span className="info-label">Difficulty</span>
              <Badge variant="primary">{previewRecipe.difficulty}</Badge>
              {isChanged.difficulty && (
                <Badge variant="secondary" className="change-badge">
                  Changed
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
        <Card className={isChanged.cooking_time ? "changed-section" : ""}>
          <CardContent>
            <div className="info-item">
              <span className="info-label">Cooking Time</span>
              <span className="info-value">
                ⏱ {previewRecipe.cooking_time} min
              </span>
              {isChanged.cooking_time && (
                <Badge variant="secondary" className="change-badge">
                  Changed
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
        <Card className={isChanged.calories ? "changed-section" : ""}>
          <CardContent>
            <div className="info-item">
              <span className="info-label">Calories</span>
              <span className="info-value">
                🔥 {previewRecipe.calories ?? "—"} cal
              </span>
              {isChanged.calories && (
                <Badge variant="secondary" className="change-badge">
                  Changed
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {isEditPending && (
        <div className="recipe-pending-changes">
          <Card>
            <CardHeader>Pending Change Preview</CardHeader>
            <CardContent>
              <div className="info-item">
                <span className="info-label">Edited by</span>
                <span>{draftEditor || "Unknown"}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Preview shows updated recipe</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="recipe-content-grid">
        <div className="recipe-main">
          <Card className={isChanged.description ? "changed-section" : ""}>
            <CardHeader>Description</CardHeader>
            <CardContent>
              <p className={isChanged.description ? "changed-text" : ""}>
                {previewRecipe.description}
              </p>
              {isChanged.description && (
                <Badge variant="secondary" className="change-badge">
                  Changed
                </Badge>
              )}
            </CardContent>
          </Card>

          <Card className={isChanged.ingredients ? "changed-section" : ""}>
            <CardHeader>Ingredients</CardHeader>
            <CardContent>
              <ul className="ingredients-list">
                {(previewRecipe.ingredients || []).map((ing, idx) => (
                  <li
                    key={idx}
                    className={isChanged.ingredients ? "changed-item" : ""}
                  >
                    <span className="ingredient-name">
                      {ing.ingredient?.name}
                      {ing.ingredient?.status === "NotVerified" && (
                        <Badge variant="warning" style={{ marginLeft: 8 }}>
                          New
                        </Badge>
                      )}
                    </span>
                    <span className="ingredient-amount">
                      {ing.amount} {ing.unit}
                    </span>
                  </li>
                ))}
              </ul>
              {isChanged.ingredients && (
                <Badge variant="secondary" className="change-badge">
                  Ingredients changed
                </Badge>
              )}
            </CardContent>
          </Card>

          <Card className={isChanged.steps ? "changed-section" : ""}>
            <CardHeader>Cooking Steps</CardHeader>
            <CardContent>
              <ol className="steps-list">
                {(previewRecipe.steps || []).map((step, idx) => (
                  <li
                    key={idx}
                    className={isChanged.steps ? "changed-item" : ""}
                  >
                    {step.image_url && (
                      <img src={step.image_url} alt={`Step ${idx + 1}`} />
                    )}
                    <p>{step.description}</p>
                  </li>
                ))}
              </ol>
              {isChanged.steps && (
                <Badge variant="secondary" className="change-badge">
                  Updated steps
                </Badge>
              )}
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
                <strong>Categories:</strong>{" "}
                {(previewRecipe.categories || [])
                  .map((c) => c.name)
                  .join(", ") || "—"}
                {isChanged.categories && (
                  <Badge variant="secondary" className="change-badge">
                    Changed
                  </Badge>
                )}
              </div>
              <div style={{ marginTop: "var(--spacing-sm)" }}>
                <strong>Tags:</strong>{" "}
                {(previewRecipe.tags || []).map((t) => t.name).join(", ") ||
                  "—"}
                {isChanged.tags && (
                  <Badge variant="secondary" className="change-badge">
                    Changed
                  </Badge>
                )}
              </div>
              <div style={{ marginTop: "var(--spacing-sm)" }}>
                <strong>Cuisines:</strong>{" "}
                {(previewRecipe.cuisines || []).map((c) => c.name).join(", ") ||
                  "—"}
                {isChanged.cuisines && (
                  <Badge variant="secondary" className="change-badge">
                    Changed
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminRecipeModerationPage;
