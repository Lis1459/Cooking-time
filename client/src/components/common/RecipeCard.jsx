import { useMemo } from "react";
import { Card, CardContent, Badge, Button } from "../ui";
import { SOCKET_URL } from "../../config/constants";
import "./RecipeCard.css";
import { RecipeDifficulty } from "../../utils/recipeConst";

const getRecipeRating = (recipe) => {
  const avg =
    recipe.rating?.average ??
    recipe.avgRating ??
    recipe.average_rating ??
    recipe.averageRating ??
    recipe.rating;
  return avg;
};

export const RecipeCard = ({
  recipe,
  onView,
  actions,
  buttonLabel = "Смотреть рецепт",
  showDefaultAction = true,
  className = "",
  showIndicators = true,
}) => {
  const rating = useMemo(() => getRecipeRating(recipe), [recipe]);

  return (
    <Card className={`recipe-card ${className}`.trim()}>
      {recipe.preview_img_url && (
        <div className="recipe-card__image-wrapper">
          <img
            src={`${SOCKET_URL}${recipe.preview_img_url}`}
            alt={recipe.title}
            className="recipe-card__image"
          />
          {showIndicators && recipe.isFavorite && (
            <div className="recipe-indicator favorite" title="В избранном">
              ❤️
            </div>
          )}
          {showIndicators && recipe.cookMark === "COOKED" && (
            <div className="recipe-indicator cooked" title="Уже готовили">
              ✓
            </div>
          )}
        </div>
      )}

      <CardContent>
        <h3>{recipe.title}</h3>
        {recipe.description && (
          <p className="recipe-card__description truncate-single-line">
            {recipe.description}
          </p>
        )}

        {rating ? (
          <div className="recipe-card__rating">
            ⭐ {typeof rating === "number" ? rating.toFixed(1) : rating}
          </div>
        ) : null}

        <div className="recipe-card__meta">
          <div className="recipe-card__badges">
            <Badge variant="primary">
              {RecipeDifficulty[recipe.difficulty]}
            </Badge>
            {recipe.calories != null && (
              <Badge variant="success">{recipe.calories} ккал</Badge>
            )}
          </div>
          <span className="recipe-card__time">
            ⏱️ {recipe.cooking_time} мин
          </span>
        </div>

        {actions ||
          (showDefaultAction && (
            <Button
              variant="primary"
              style={{ width: "100%", marginTop: "var(--spacing-md)" }}
              onClick={onView}
            >
              {buttonLabel}
            </Button>
          ))}
      </CardContent>
    </Card>
  );
};

export default RecipeCard;
