import { useEffect, useRef, useState } from "react";
import { useNavigate, useNavigationType } from "react-router-dom";
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
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalRecipes, setTotalRecipes] = useState(0);
  const [ingredientInput, setIngredientInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchInput = useRef();
  const sentinelRef = useRef(null);
  const isRestoring = useRef(true);

  const isBackNavigation = useNavigationType() === "POP";
  useEffect(() => {
    console.log(isBackNavigation);

    const saved = sessionStorage.getItem("smartRecipesState");

    if (isBackNavigation && saved) {
      const parsed = JSON.parse(saved);

      setIngredients(parsed.ingredients || []);
      setMatchedRecipes(parsed.matchedRecipes || []);
      setPage(parsed.page || 1);
      setHasMore(parsed.hasMore || false);
      setTotalRecipes(parsed.totalRecipes || 0);
      setIngredientInput(parsed.ingredientInput || "");
      setShowSuggestions(false);

      console.log("State restored");
    } else {
      // 👉 новый заход — очищаем
      sessionStorage.removeItem("smartRecipesState");

      console.log("Fresh page");
    }

    fetchAvailableIngredients();

    setTimeout(() => {
      isRestoring.current = false;
    }, 0);
  }, [isBackNavigation]);

  useEffect(() => {
    if (isRestoring.current) return;
    sessionStorage.setItem(
      "smartRecipesState",
      JSON.stringify({
        ingredients,
        matchedRecipes,
        page,
        hasMore,
        totalRecipes,
        ingredientInput,
      }),
    );
  }, [
    ingredients,
    matchedRecipes,
    page,
    hasMore,
    totalRecipes,
    ingredientInput,
  ]);

  // useEffect(() => {
  //   fetchAvailableIngredients();
  // }, []);

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
      searchInput.current.blur();
      setShowSuggestions(false);
    }
  };

  const handleRemoveIngredient = (ingredientId) => {
    setIngredients(ingredients.filter((i) => i.id !== ingredientId));
  };

  const fetchRecipes = async (pageToLoad = 1) => {
    if (ingredients.length === 0) return;

    try {
      if (pageToLoad === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const ingredientIds = ingredients.map((i) => i.id);
      const data = await recipeService.smartSearch(
        ingredientIds,
        pageToLoad,
        10,
      );
      const newRecipes = data.recipes || [];

      setMatchedRecipes((prev) =>
        pageToLoad === 1 ? newRecipes : [...prev, ...newRecipes],
      );
      setTotalRecipes(data.total || 0);
      setHasMore(pageToLoad * 10 < (data.total || 0));
    } catch (error) {
      console.error("Failed to fetch recipes:", error);
    } finally {
      if (pageToLoad === 1) {
        setLoading(false);
      } else {
        setLoadingMore(false);
      }
    }
  };

  const handleSearch = async () => {
    if (ingredients.length === 0) return;

    setPage(1);
    setMatchedRecipes([]);
    setTotalRecipes(0);
    setHasMore(false);

    await fetchRecipes(1);
  };

  useEffect(() => {
    if (isRestoring.current) return;
    if (page === 1) return;
    fetchRecipes(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  useEffect(() => {
    if (!hasMore || loading || loadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setPage((prevPage) => prevPage + 1);
        }
      },
      { rootMargin: "200px" },
    );

    const current = sentinelRef.current;
    if (current) observer.observe(current);

    return () => {
      if (current) observer.unobserve(current);
    };
  }, [hasMore, loading, loadingMore]);

  const filteredIngredients = availableIngredients.filter(
    (i) =>
      i.name.toLowerCase().includes(ingredientInput.toLowerCase()) &&
      !ingredients.find((ing) => ing.id === i.id),
  );

  return (
    <div className="smart-recipes">
      <Card>
        <CardHeader>Поиск рецептов по ингредиентам</CardHeader>
        <CardContent>
          <p className="smart-recipes__subtitle">
            Введите ингредиенты, которые у вас есть, и найдите рецепты, которые
            вы можете приготовитьоторые вы можете приготовить!
          </p>

          {/* Ingredient Input */}
          <div className="smart-recipes__ingredient-section">
            <div className="smart-recipes__ingredient-input-wrapper">
              <Input
                ref={searchInput}
                type="text"
                placeholder="Поиск ингредиентов..."
                value={ingredientInput}
                onChange={(e) => {
                  setIngredientInput(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
              />
              {filteredIngredients.length > 0 && showSuggestions && (
                <div className="smart-recipes__ingredient-suggestions">
                  {filteredIngredients.map((ing) => (
                    <button
                      key={ing.id}
                      className="smart-recipes__suggestion-item"
                      onMouseDown={(e) => e.preventDefault()}
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
            <div className="smart-recipes__selected-ingredients">
              <p className="smart-recipes__selected-label">
                Selected Ingredients ({ingredients.length})
              </p>
              <div className="smart-recipes__ingredients-tags">
                {ingredients.map((ing) => (
                  <div key={ing.id} className="smart-recipes__ingredient-tag">
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
              ? "Поиск..."
              : `Найти рецепты (${ingredients.length} ингредиентов)`}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {matchedRecipes.length > 0 && (
        <div className="smart-recipes__results">
          <h2>Найдено {totalRecipes || matchedRecipes.length} рецептовтов</h2>
          <div className="smart-recipes__recipes-grid">
            {matchedRecipes.map((recipe) => (
              <Card key={recipe.id} className="smart-recipes__recipe-card">
                <img
                  src={`${SOCKET_URL}${recipe.preview_img_url}`}
                  alt={recipe.title}
                  className="smart-recipes__recipe-image"
                />
                <CardContent>
                  <h3>{recipe.title}</h3>
                  <p className="smart-recipes__recipe-description">
                    {recipe.description.substring(0, 100)}...
                  </p>
                  <div className="smart-recipes__recipe-meta">
                    <Badge variant="primary">{recipe.difficulty}</Badge>
                    <span className="smart-recipes__cooking-time">
                      ⏱️ {recipe.cooking_time}min
                    </span>
                  </div>
                  <div style={{ marginBottom: "var(--spacing-md)" }}>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "var(--gray-600)",
                        marginBottom: "4px",
                      }}
                    >
                      Match: {recipe.availableIngredientsCount}/
                      {recipe.totalIngredientsCount} ingredients (
                      {recipe.matchPercentage}%)
                    </div>
                    <div
                      style={{
                        width: "100%",
                        height: "4px",
                        backgroundColor: "var(--gray-200)",
                        borderRadius: "2px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${recipe.matchPercentage}%`,
                          backgroundColor:
                            recipe.matchPercentage === 100
                              ? "#4CAF50"
                              : recipe.matchPercentage >= 50
                                ? "#FFC107"
                                : "#FF9800",
                          transition: "width 0.3s ease",
                        }}
                      />
                    </div>
                  </div>
                  <Button
                    variant="primary"
                    style={{ width: "100%", marginTop: "var(--spacing-md)" }}
                    onClick={() => navigate(`/recipes/${recipe.id}`)}
                  >
                    Смотреть рецептцепт
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          {hasMore && (
            <div ref={sentinelRef} style={{ width: "100%", height: "1px" }} />
          )}
          {loadingMore && (
            <div className="smart-recipes__loading">
              <Loader size="lg" />
            </div>
          )}
        </div>
      )}

      {loading && (
        <div className="smart-recipes__loading">
          <Loader size="lg" />
        </div>
      )}

      {!loading && matchedRecipes.length === 0 && ingredients.length > 0 && (
        <div className="smart-recipes__no-results">
          <p>Рецепты с этими ингредиентами не найдены. Попробуйте другие!</p>
          <Button variant="outline" onClick={() => navigate("/recipes")}>
            Просмотреть все рецепты
          </Button>
        </div>
      )}
    </div>
  );
};

export default SmartRecipesPage;
