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
import "./RecipeCatalog.css";
import { SOCKET_URL } from "../config/constants";

export const RecipeCatalogPage = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    search: "",
    category: null,
    difficulty: null,
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

  const handleCategoryFilter = (e) => {
    const categoryId = e.target.value ? parseInt(e.target.value) : null;
    setFilters((prev) => ({ ...prev, category: categoryId }));
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

  const handleDifficultyFilter = (e) => {
    const difficulty = e.target.value || null;
    setFilters((prev) => ({ ...prev, difficulty }));
  };

  const handleClearFilters = () => {
    setFilters({
      search: "",
      category: null,
      difficulty: null,
    });
    setCurrentPage(1);
    setRecipes([]);
    setHasMore(false);
  };

  useEffect(() => {
    setCurrentPage(1);
    fetchRecipes(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.search, filters.category, filters.difficulty]);

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
      <h1>Recipe Catalog</h1>

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <Input
            type="text"
            placeholder="Search recipes..."
            value={filters.search}
            onChange={handleSearch}
          />
        </div>

        <div className="filter-group">
          <Select
            options={categories?.map((cat) => ({
              value: cat.id,
              name: cat.name,
            }))}
            value={filters.category || ""}
            onChange={handleCategoryFilter}
            placeholder="All Categories"
          />
        </div>

        <div className="filter-group">
          <Select
            options={[
              { value: "VERY_EASY", name: "Very Easy" },
              { value: "EASY", name: "Easy" },
              { value: "MEDIUM", name: "Medium" },
              { value: "HARD", name: "Hard" },
              { value: "VERY_HARD", name: "Very Hard" },
            ]}
            value={filters.difficulty || ""}
            onChange={handleDifficultyFilter}
            placeholder="All Difficulties"
          />
        </div>

        <Button variant="outline" onClick={handleClearFilters}>
          Clear Filters
        </Button>
      </div>

      {/* Results Count */}
      <div className="results-info">
        <p>Found {totalRecipes} recipes</p>
      </div>

      {isLoading && (
        <div className="loading-container">
          <Loader size="lg" />
        </div>
      )}
      {/* Recipes Grid */}
      {recipes.length > 0 ? (
        <div className="recipes-grid">
          {recipes.map((recipe) => (
            <Card key={recipe.id} className="recipe-card">
              <img
                src={`${SOCKET_URL}${recipe.preview_img_url}`}
                alt={recipe.title}
                className="recipe-image"
              />
              <CardContent>
                <h3>{recipe.title}</h3>
                <p className="recipe-description">
                  {recipe.description.substring(0, 80)}...
                </p>
                <div className="recipe-meta">
                  <div className="recipe-tags">
                    <Badge variant="primary">{recipe.difficulty}</Badge>
                    <Badge variant="success">{recipe.calories} cal</Badge>
                  </div>
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
          {hasMore && (
            <div ref={sentinelRef} style={{ width: "100%", height: "1px" }} />
          )}
          {loadingMore && (
            <div className="loading-container">
              <Loader size="lg" />
            </div>
          )}
        </div>
      ) : (
        <div className="empty-state">
          <p>No recipes found. Try adjusting your filters.</p>
          <Button variant="primary" onClick={handleClearFilters}>
            Clear All Filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default RecipeCatalogPage;
