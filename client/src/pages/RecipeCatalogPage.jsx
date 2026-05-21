import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { recipeService, useCategoriesQuery } from "../services/apiService";
import {
  Card,
  CardContent,
  Button,
  Input,
  Select,
  Badge,
  Loader,
} from "../components/ui";
import { FilterModal } from "../components/common/FilterModal";
import "./RecipeCatalog.css";
import { SOCKET_URL } from "../config/constants";

export const RecipeCatalogPage = () => {
  const navigate = useNavigate();
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    categories: [],
    tags: [],
    cuisines: [],
    difficulty: null,
    caloriesMin: null,
    caloriesMax: null,
    cookingTimeMin: null,
    cookingTimeMax: null,
  });
  const [recipes, setRecipes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [totalRecipes, setTotalRecipes] = useState(0);
  const limit = 20;
  const sentinelRef = useRef(null);
  const { data: categories } = useCategoriesQuery();

  const handleSearch = (e) => {
    const searchTerm = e.target.value;
    setFilters((prev) => ({ ...prev, search: searchTerm }));
  };

  const handleApplyFilters = (newFilters) => {
    setFilters((prev) => ({
      ...prev,
      categories: newFilters.categories || [],
      tags: newFilters.tags || [],
      cuisines: newFilters.cuisines || [],
      difficulty: newFilters.difficulty || null,
      caloriesMin: newFilters.caloriesMin
        ? parseInt(newFilters.caloriesMin)
        : null,
      caloriesMax: newFilters.caloriesMax
        ? parseInt(newFilters.caloriesMax)
        : null,
      cookingTimeMin: newFilters.cookingTimeMin
        ? parseInt(newFilters.cookingTimeMin)
        : null,
      cookingTimeMax: newFilters.cookingTimeMax
        ? parseInt(newFilters.cookingTimeMax)
        : null,
    }));
  };

  const fetchRecipes = async (pageToLoad = 1) => {
    try {
      if (pageToLoad === 1) {
        setIsLoading(true);
      } else {
        setLoadingMore(true);
      }

      const params = {
        ...filters,
        page: pageToLoad,
        limit,
      };
      const data = await recipeService.getRecipes(params);
      const newRecipes = data.recipes || [];

      setRecipes((prev) =>
        pageToLoad === 1 ? newRecipes : [...prev, ...newRecipes],
      );
      setTotalRecipes(data.total || newRecipes.length);
      setHasMore(pageToLoad * limit < (data.total || 0));
    } catch (error) {
      console.error("Failed to load recipes:", error);
    } finally {
      if (pageToLoad === 1) {
        setIsLoading(false);
      } else {
        setLoadingMore(false);
      }
    }
  };

  const handleClearFilters = () => {
    setFilters({
      search: "",
      categories: [],
      tags: [],
      cuisines: [],
      difficulty: null,
      caloriesMin: null,
      caloriesMax: null,
      cookingTimeMin: null,
      cookingTimeMax: null,
    });
    setCurrentPage(1);
  };

  useEffect(() => {
    setCurrentPage(1);
    fetchRecipes(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filters.search,
    filters.categories,
    filters.tags,
    filters.cuisines,
    filters.difficulty,
    filters.caloriesMin,
    filters.caloriesMax,
    filters.cookingTimeMin,
    filters.cookingTimeMax,
  ]);

  useEffect(() => {
    if (currentPage === 1) return;
    fetchRecipes(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  useEffect(() => {
    if (!hasMore || isLoading || loadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setCurrentPage((prevPage) => prevPage + 1);
        }
      },
      { rootMargin: "200px" },
    );

    const current = sentinelRef.current;
    if (current) observer.observe(current);

    return () => {
      if (current) observer.unobserve(current);
    };
  }, [hasMore, isLoading, loadingMore]);

  return (
    <div className="recipe-catalog">
      <h1>Каталог рецептов</h1>

      {/* Filters Header */}
      <div className="recipe-catalog__filters-header">
        <Input
          type="text"
          placeholder="Поиск рецептов..."
          value={filters.search}
          onChange={handleSearch}
          className="recipe-catalog__search-input"
        />
        <Button
          variant="outline"
          onClick={() => setShowFiltersModal(true)}
          className="recipe-catalog__filters-button"
        >
          ⚙️ Показать все фильтры
        </Button>
      </div>

      {/* Filter Modal */}
      <FilterModal
        isOpen={showFiltersModal}
        onClose={() => setShowFiltersModal(false)}
        onApplyFilters={handleApplyFilters}
        initialFilters={filters}
      />

      {/* Active Filters Display */}
      {(filters.categories.length > 0 ||
        filters.tags.length > 0 ||
        filters.cuisines.length > 0 ||
        filters.difficulty ||
        filters.caloriesMin ||
        filters.caloriesMax ||
        filters.cookingTimeMin ||
        filters.cookingTimeMax) && (
        <div className="recipe-catalog__active-filters">
          <div className="recipe-catalog__active-filters-list">
            {filters.categories.length > 0 && (
              <span className="recipe-catalog__active-filter-badge">
                Категории: {filters.categories.length}
              </span>
            )}
            {filters.tags.length > 0 && (
              <span className="recipe-catalog__active-filter-badge">
                Теги: {filters.tags.length}
              </span>
            )}
            {filters.cuisines.length > 0 && (
              <span className="recipe-catalog__active-filter-badge">
                Кухни: {filters.cuisines.length}
              </span>
            )}
            {filters.difficulty && (
              <span className="recipe-catalog__active-filter-badge">
                Сложность: {filters.difficulty}
              </span>
            )}
            {(filters.caloriesMin || filters.caloriesMax) && (
              <span className="recipe-catalog__active-filter-badge">
                Калории: {filters.caloriesMin || "0"}-
                {filters.caloriesMax || "∞"}
              </span>
            )}
            {(filters.cookingTimeMin || filters.cookingTimeMax) && (
              <span className="recipe-catalog__active-filter-badge">
                Время: {filters.cookingTimeMin || "0"}-
                {filters.cookingTimeMax || "∞"} мин
              </span>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearFilters}
            className="recipe-catalog__clear-button"
          >
            ✕ Сбросить фильтры
          </Button>
        </div>
      )}

      {/* Results Count */}
      <div className="recipe-catalog__results-info">
        <p>Найдено {totalRecipes} рецептов</p>
      </div>

      {isLoading && (
        <div className="recipe-catalog__loading">
          <Loader size="lg" />
        </div>
      )}
      {/* Recipes Grid */}
      {recipes.length > 0 ? (
        <div className="recipe-catalog__recipes-grid">
          {recipes.map((recipe) => (
            <Card key={recipe.id} className="recipe-catalog__recipe-card">
              <img
                src={`${SOCKET_URL}${recipe.preview_img_url}`}
                alt={recipe.title}
                className="recipe-catalog__recipe-image"
              />
              <CardContent>
                <h3>{recipe.title}</h3>
                <p className="recipe-catalog__recipe-description truncate-single-line">
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
                <div className="recipe-catalog__recipe-meta">
                  <div className="recipe-catalog__recipe-tags">
                    <Badge variant="primary">{recipe.difficulty}</Badge>
                    <Badge variant="success">{recipe.calories} cal</Badge>
                  </div>
                  <span className="recipe-catalog__cooking-time">
                    ⏱️ {recipe.cooking_time}min
                  </span>
                </div>
                <Button
                  variant="primary"
                  style={{ width: "100%", marginTop: "var(--spacing-md)" }}
                  onClick={() => navigate(`/recipes/${recipe.id}`)}
                >
                  Смотреть рецепт
                </Button>
              </CardContent>
            </Card>
          ))}
          {hasMore && (
            <div ref={sentinelRef} style={{ width: "100%", height: "1px" }} />
          )}
          {loadingMore && (
            <div className="recipe-catalog__loading">
              <Loader size="lg" />
            </div>
          )}
        </div>
      ) : (
        <div className="recipe-catalog__empty-state">
          <p>Рецепты не найдены. Попробуйте изменить фильтры.</p>
          <Button variant="primary" onClick={handleClearFilters}>
            Сбросить фильтры
          </Button>
        </div>
      )}
    </div>
  );
};

export default RecipeCatalogPage;
