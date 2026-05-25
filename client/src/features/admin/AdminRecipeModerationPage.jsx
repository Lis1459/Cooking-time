import { useEffect, useState } from "react";
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
  Textarea,
  Modal,
} from "../../components/ui";
import { SOCKET_URL } from "../../config/constants";
import "./AdminPanel.css";

const createLookup = (items) =>
  items.reduce((map, item) => {
    map[item.id] = item.name;
    return map;
  }, {});

const normalizeDraftIds = (value) => {
  if (!value) return [];
  if (typeof value === "string") {
    try {
      return JSON.parse(value)
        .map((id) => Number(id))
        .filter((id) => !Number.isNaN(id));
    } catch {
      return [];
    }
  }
  if (Array.isArray(value)) {
    return value
      .map((item) =>
        item && typeof item === "object" && "id" in item
          ? Number(item.id)
          : Number(item),
      )
      .filter((id) => !Number.isNaN(id));
  }
  if (value.set) return normalizeDraftIds(value.set);
  if (value.connect) return normalizeDraftIds(value.connect);
  return [];
};

const normalizeDraftSteps = (stepsValue) => {
  if (!stepsValue) return [];
  let steps = [];

  if (typeof stepsValue === "string") {
    try {
      steps = JSON.parse(stepsValue);
    } catch {
      steps = [];
    }
  } else if (Array.isArray(stepsValue)) {
    steps = stepsValue;
  } else if (stepsValue.create) {
    steps = Array.isArray(stepsValue.create) ? stepsValue.create : [];
  }

  return steps
    .map((step, idx) => ({
      description: step.description,
      step_number: Number(step.step_number ?? idx + 1),
      image_url: step.image_url,
    }))
    .sort((a, b) => a.step_number - b.step_number);
};

export const AdminRecipeModerationPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: recipeData, isLoading } = useAdminRecipeQuery(id);
  const { data: categories = [] } = useCategoriesQuery();
  const { data: tags = [] } = useTagsQuery();
  const { data: cuisines = [] } = useCuisinesQuery();
  const [rejectReason, setRejectReason] = useState("");

  const approveMutation = useApproveRecipeMutation();
  const rejectMutation = useRejectRecipeMutation();
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [localRejectReason, setLocalRejectReason] = useState("");

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
        <p>Рецепт не найден.</p>
        <Button onClick={() => navigate("/admin")}>Назад</Button>
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

  const draftCategoryIds = normalizeDraftIds(draftData.categories);
  const draftTagIds = normalizeDraftIds(draftData.tags);
  const draftCuisineIds = normalizeDraftIds(draftData.cuisines);
  const draftSteps = normalizeDraftSteps(draftData.steps);

  const previewRecipe = {
    ...recipe,
    title: draftData.title ?? recipe.title,
    description: draftData.description ?? recipe.description,
    cooking_time: draftData.cooking_time ?? recipe.cooking_time,
    calories: draftData.calories ?? recipe.calories,
    difficulty: draftData.difficulty ?? recipe.difficulty,
    preview_img_url: draftData.preview_img_url ?? recipe.preview_img_url,
    categories:
      draftData.categories !== undefined
        ? draftCategoryIds.map((id) => ({
            id,
            name: categoryMap[id] || `#${id}`,
          }))
        : recipe.categories || [],
    tags:
      draftData.tags !== undefined
        ? draftTagIds.map((id) => ({
            id,
            name: tagMap[id] || `#${id}`,
          }))
        : recipe.tags || [],
    cuisines:
      draftData.cuisines !== undefined
        ? draftCuisineIds.map((id) => ({
            id,
            name: cuisineMap[id] || `#${id}`,
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
    steps: draftSteps.length > 0 ? draftSteps : recipe.steps || [],
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

  const recipeSteps = (recipe.steps || [])
    .map((step) => ({
      step_number: Number(step.step_number),
      description: step.description,
      image_url: step.image_url,
    }))
    .sort((a, b) => a.step_number - b.step_number);

  const sortIngredients = (items) =>
    [...items].sort((a, b) => {
      if (a.id !== b.id) return (a.id ?? 0) - (b.id ?? 0);
      if (a.name !== b.name) return a.name.localeCompare(b.name);
      if (a.amount !== b.amount) return a.amount - b.amount;
      return (a.unit || "").localeCompare(b.unit || "");
    });

  const normalizedRecipeIngredients = sortIngredients(recipeIngredients);
  const normalizedDraftIngredients = sortIngredients(draftIngredients);
  const normalizedDraftSteps = [...draftSteps].sort(
    (a, b) => Number(a.step_number) - Number(b.step_number),
  );

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
      draftData.categories !== undefined &&
      JSON.stringify(draftCategoryIds.sort()) !==
        JSON.stringify((recipe.categories || []).map((c) => c.id).sort()),
    tags:
      draftData.tags !== undefined &&
      JSON.stringify(draftTagIds.sort()) !==
        JSON.stringify((recipe.tags || []).map((t) => t.id).sort()),
    cuisines:
      draftData.cuisines !== undefined &&
      JSON.stringify(draftCuisineIds.sort()) !==
        JSON.stringify((recipe.cuisines || []).map((c) => c.id).sort()),
    ingredients:
      draftIngredients.length > 0 &&
      JSON.stringify(normalizedRecipeIngredients) !==
        JSON.stringify(normalizedDraftIngredients),
    steps:
      draftSteps.length > 0 &&
      JSON.stringify(recipeSteps) !== JSON.stringify(normalizedDraftSteps),
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
          <div className="recipe-hero-placeholder">Нет изображения</div>
        )}
      </div>

      <div className="recipe-header">
        <div>
          <h1>
            {previewRecipe.title}
            {isChanged.title && (
              <Badge variant="secondary" style={{ marginLeft: 8 }}>
                Изменено
              </Badge>
            )}
          </h1>
          <p className="recipe-author">Автор: {recipe.author?.name}</p>
          {isEditPending && (
            <Badge variant="secondary" style={{ marginTop: 8 }}>
              Ожидает обновления
            </Badge>
          )}
        </div>
        <div className="recipe-actions">
          <Button
            variant="success"
            onClick={() => approveMutation.mutate(recipe.id)}
            disabled={approveMutation.isLoading}
          >
            Одобрить
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              setLocalRejectReason("");
              setShowRejectModal(true);
            }}
            disabled={rejectMutation.isLoading}
          >
            Отклонить
          </Button>
          <Button variant="outline" onClick={() => navigate("/admin")}>
            Назад
          </Button>
        </div>

        <Modal
          isOpen={showRejectModal}
          onClose={() => setShowRejectModal(false)}
          title="Причина отклонения"
          footer={
            <div
              style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}
            >
              <Button
                variant="secondary"
                onClick={() => setShowRejectModal(false)}
              >
                Отмена
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  setShowRejectModal(false);
                  rejectMutation.mutate({
                    id: recipe.id,
                    reason: localRejectReason,
                  });
                }}
                disabled={!localRejectReason.trim() || rejectMutation.isLoading}
              >
                Отклонить
              </Button>
            </div>
          }
        >
          <div style={{ padding: "8px 0" }}>
            <p>
              Введите причину отклонения рецепта. Комментарий будет отправлен
              автору.
            </p>
            <Textarea
              value={localRejectReason}
              onChange={(e) => setLocalRejectReason(e.target.value)}
              placeholder="Причина отклонения"
              rows={5}
            />
          </div>
        </Modal>
      </div>

      {isEditPending && (
        <div className="recipe-pending-changes">
          <Card>
            <CardHeader>Предпросмотр изменений</CardHeader>
            <CardContent>
              <div className="info-item">
                <span className="info-label">Отредактировано</span>
                <span>{draftEditor || "Неизвестно"}</span>
              </div>
              <div className="info-item">
                <span className="info-label">
                  Предпросмотр показывает обновленный рецепт
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="recipe-content-grid">
        <div className="recipe-main">
          <Card className={isChanged.description ? "changed-section" : ""}>
            <CardHeader>Описание</CardHeader>
            <CardContent>
              <p className={isChanged.description ? "changed-text" : ""}>
                {previewRecipe.description}
              </p>
              {isChanged.description && (
                <Badge variant="secondary" className="change-badge">
                  Изменено
                </Badge>
              )}
            </CardContent>
          </Card>

          <Card className={isChanged.ingredients ? "changed-section" : ""}>
            <CardHeader>Ингредиенты</CardHeader>
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
                          Новый
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
                  Ингредиенты изменены
                </Badge>
              )}
            </CardContent>
          </Card>

          <Card className={isChanged.steps ? "changed-section" : ""}>
            <CardHeader>Шаги приготовления</CardHeader>
            <CardContent>
              <ol className="steps-list">
                {(previewRecipe.steps || []).map((step, idx) => (
                  <li
                    key={idx}
                    className={isChanged.steps ? "changed-item" : ""}
                  >
                    {step.image_url && (
                      <img src={step.image_url} alt={`Шаг ${idx + 1}`} />
                    )}
                    <p>{step.description}</p>
                  </li>
                ))}
              </ol>
              {isChanged.steps && (
                <Badge variant="secondary" className="change-badge">
                  Шаги обновлены
                </Badge>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="recipe-sidebar">
          <Card>
            <CardHeader>Сводка</CardHeader>
            <CardContent>
              <div className="info-item">
                <span className="info-label">Статус</span>
                <Badge variant="warning">{recipe.status}</Badge>
              </div>
              <div style={{ marginTop: "var(--spacing-sm)" }}>
                <strong>Категории:</strong>{" "}
                {(previewRecipe.categories || [])
                  .map((c) => c.name)
                  .join(", ") || "—"}
                {isChanged.categories && (
                  <Badge variant="secondary" className="change-badge">
                    Изменено
                  </Badge>
                )}
              </div>
              <div style={{ marginTop: "var(--spacing-sm)" }}>
                <strong>Теги:</strong>{" "}
                {(previewRecipe.tags || []).map((t) => t.name).join(", ") ||
                  "—"}
                {isChanged.tags && (
                  <Badge variant="secondary" className="change-badge">
                    Изменено
                  </Badge>
                )}
              </div>
              <div style={{ marginTop: "var(--spacing-sm)" }}>
                <strong>Кухни:</strong>{" "}
                {(previewRecipe.cuisines || []).map((c) => c.name).join(", ") ||
                  "—"}
                {isChanged.cuisines && (
                  <Badge variant="secondary" className="change-badge">
                    Изменено
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
