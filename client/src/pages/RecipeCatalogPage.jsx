import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRecipesQuery, useCategoriesQuery } from "../services/apiService";
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

// Hardcoded categories (or fetch them with React Query if needed)
const CATEGORIES = [
  { id: 1, name: "Breakfast" },
  { id: 2, name: "Lunch" },
  { id: 3, name: "Dinner" },
  { id: 4, name: "Dessert" },
  { id: 5, name: "Snack" },
];

export const RecipeCatalogPage = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    search: "",
    category: null,
    difficulty: null,
    page: 1,
    limit: 20,
  });

  const { data: recipeData, isLoading } = useRecipesQuery(filters);
  const { data: categories } = useCategoriesQuery();

  const recipes = recipeData ? recipeData.recipes : [];

  const handleSearch = (e) => {
    const searchTerm = e.target.value;
    setFilters((prev) => ({ ...prev, search: searchTerm }));
  };

  const handleCategoryFilter = (e) => {
    const categoryId = e.target.value ? parseInt(e.target.value) : null;
    setFilters((prev) => ({ ...prev, category: categoryId }));
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
      page: 1,
      limit: 20,
    });
  };

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
        <p>Found {recipes.length} recipes</p>
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
