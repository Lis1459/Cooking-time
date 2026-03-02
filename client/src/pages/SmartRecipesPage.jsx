import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ingredientService, recipeService } from "../services/apiService";
import {
  Card,
  CardContent,
  CardHeader,
  Button,
  Input,
  Loader,
  Badge,
} from "../components/ui";
import "./SmartRecipes.css";
import { SOCKET_URL } from "../config/constants";

export const SmartRecipesPage = () => {
  const navigate = useNavigate();
  const [ingredients, setIngredients] = useState([]);
  const [availableIngredients, setAvailableIngredients] = useState([]);
  const [matchedRecipes, setMatchedRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [ingredientInput, setIngredientInput] = useState("");

  useEffect(() => {
    fetchAvailableIngredients();
  }, []);

  const fetchAvailableIngredients = async () => {
    try {
      const data = await ingredientService.getIngredients();
      setAvailableIngredients(data || []);
    } catch (error) {
      console.error("Failed to fetch ingredients:", error);
    }
  };

  const handleAddIngredient = (ingredient) => {
    if (!ingredients.find((i) => i.id === ingredient.id)) {
      setIngredients([...ingredients, ingredient]);
      setIngredientInput("");
    }
  };

  const handleRemoveIngredient = (ingredientId) => {
    setIngredients(ingredients.filter((i) => i.id !== ingredientId));
  };

  const handleSearch = async () => {
    if (ingredients.length === 0) return;

    try {
      setLoading(true);
      const ingredientIds = ingredients.map((i) => i.id);
      const data = await recipeService.getRecipes({
        ingredientIds: ingredientIds.join(","),
      });
      setMatchedRecipes(data.recipes || []);
    } catch (error) {
      console.error("Failed to fetch recipes:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredIngredients = availableIngredients.filter(
    (i) =>
      i.name.toLowerCase().includes(ingredientInput.toLowerCase()) &&
      !ingredients.find((ing) => ing.id === i.id),
  );

  return (
    <div className="smart-recipes">
      <Card>
        <CardHeader>Find Recipes by Ingredients</CardHeader>
        <CardContent>
          <p className="subtitle">
            Enter the ingredients you have, and find recipes you can make!
          </p>

          {/* Ingredient Input */}
          <div className="ingredient-section">
            <div className="ingredient-input-wrapper">
              <Input
                type="text"
                placeholder="Search ingredients..."
                value={ingredientInput}
                onChange={(e) => setIngredientInput(e.target.value)}
              />
              {filteredIngredients.length > 0 && ingredientInput && (
                <div className="ingredient-suggestions">
                  {filteredIngredients.slice(0, 5).map((ing) => (
                    <button
                      key={ing.id}
                      className="suggestion-item"
                      onClick={() => handleAddIngredient(ing)}
                    >
                      {ing.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Selected Ingredients */}
          {ingredients.length > 0 && (
            <div className="selected-ingredients">
              <p className="selected-label">
                Selected Ingredients ({ingredients.length})
              </p>
              <div className="ingredients-tags">
                {ingredients.map((ing) => (
                  <div key={ing.id} className="ingredient-tag">
                    <span>{ing.name}</span>
                    <button onClick={() => handleRemoveIngredient(ing.id)}>
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search Button */}
          <Button
            variant="primary"
            size="lg"
            onClick={handleSearch}
            disabled={ingredients.length === 0 || loading}
            style={{ width: "100%", marginTop: "var(--spacing-lg)" }}
          >
            {loading
              ? "Searching..."
              : `Search Recipes (${ingredients.length} ingredients)`}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {matchedRecipes.length > 0 && (
        <div className="results-section">
          <h2>Found {matchedRecipes.length} Recipes</h2>
          <div className="recipes-grid">
            {matchedRecipes.map((recipe) => (
              <Card key={recipe.id} className="recipe-card">
                <img
                  src={`${SOCKET_URL}${recipe.preview_img_url}`}
                  alt={recipe.title}
                  className="recipe-image"
                />
                <CardContent>
                  <h3>{recipe.title}</h3>
                  <p className="recipe-description">
                    {recipe.description.substring(0, 100)}...
                  </p>
                  <div className="recipe-meta">
                    <Badge variant="primary">{recipe.difficulty}</Badge>
                    <span className="cooking-time">
                      ⏱️ {recipe.cooking_time}min
                    </span>
                  </div>
                  <Button
                    variant="primary"
                    style={{ width: "100%", marginTop: "var(--spacing-md)" }}
                    onClick={() => navigate(`/recipes/${recipe.id}`)}
                  >
                    View Recipe
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {loading && (
        <div className="loading-container">
          <Loader size="lg" />
        </div>
      )}

      {!loading && matchedRecipes.length === 0 && ingredients.length > 0 && (
        <div className="no-results">
          <p>No recipes found with those ingredients. Try different ones!</p>
          <Button variant="outline" onClick={() => navigate("/recipes")}>
            Browse All Recipes
          </Button>
        </div>
      )}
    </div>
  );
};

export default SmartRecipesPage;
