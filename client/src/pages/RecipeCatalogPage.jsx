import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  recipeService,
  useCategoriesQuery,
  useTagsQuery,
  useCuisinesQuery,
} from "../services/apiService";
import { Button, Input, Badge, Loader } from "../components/ui";
import { FilterModal } from "../components/common/FilterModal";
import RecipeCard from "../components/common/RecipeCard";
import "./RecipeCatalog.css";
import { RecipeDifficulty } from "./../utils/recipeConst";

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
  const { data: tags } = useTagsQuery();
  const { data: cuisines } = useCuisinesQuery();

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

  const handleRemoveFilter = (field, value) => {
    setFilters((prev) => {
      if (field === "difficulty") {
        return { ...prev, difficulty: null };
      }
      if (field === "calories") {
        return { ...prev, caloriesMin: null, caloriesMax: null };
      }
      if (field === "cookingTime") {
        return { ...prev, cookingTimeMin: null, cookingTimeMax: null };
      }
      if (Array.isArray(prev[field])) {
        return {
          ...prev,
          [field]: prev[field].filter((item) => item !== value),
        };
      }
      return prev;
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
  console.log("recipes: ", recipes);

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
          Показать все фильтры
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
            {filters.categories.map((categoryId) => (
              <button
                key={`category-${categoryId}`}
                type="button"
                className="recipe-catalog__active-filter-badge"
                onClick={() => handleRemoveFilter("categories", categoryId)}
              >
                Категория:{" "}
                {categories?.find((item) => item.id === categoryId)?.name ||
                  categoryId}{" "}
                ×
              </button>
            ))}
            {filters.tags.map((tagId) => (
              <button
                key={`tag-${tagId}`}
                type="button"
                className="recipe-catalog__active-filter-badge"
                onClick={() => handleRemoveFilter("tags", tagId)}
              >
                Тег: {tags?.find((item) => item.id === tagId)?.name || tagId} ×
              </button>
            ))}
            {filters.cuisines.map((cuisineId) => (
              <button
                key={`cuisine-${cuisineId}`}
                type="button"
                className="recipe-catalog__active-filter-badge"
                onClick={() => handleRemoveFilter("cuisines", cuisineId)}
              >
                Кухня:{" "}
                {cuisines?.find((item) => item.id === cuisineId)?.name ||
                  cuisineId}{" "}
                ×
              </button>
            ))}
            {filters.difficulty && (
              <button
                type="button"
                className="recipe-catalog__active-filter-badge"
                onClick={() => handleRemoveFilter("difficulty")}
              >
                Сложность: {RecipeDifficulty[filters.difficulty]} ×
              </button>
            )}
            {(filters.caloriesMin || filters.caloriesMax) && (
              <button
                type="button"
                className="recipe-catalog__active-filter-badge"
                onClick={() => handleRemoveFilter("calories")}
              >
                Калории: {filters.caloriesMin || "0"}-
                {filters.caloriesMax || "∞"} ×
              </button>
            )}
            {(filters.cookingTimeMin || filters.cookingTimeMax) && (
              <button
                type="button"
                className="recipe-catalog__active-filter-badge"
                onClick={() => handleRemoveFilter("cookingTime")}
              >
                Время: {filters.cookingTimeMin || "0"}-
                {filters.cookingTimeMax || "∞"} мин ×
              </button>
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
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onView={() => navigate(`/recipes/${recipe.id}`)}
              className="recipe-catalog__recipe-card"
            />
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
