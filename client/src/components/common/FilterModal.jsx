import { useState, useEffect } from "react";
import { Modal, Button, Input, Badge } from "../ui";
import {
  useCategoriesQuery,
  useTagsQuery,
  useCuisinesQuery,
} from "../../services/apiService";
import "./FilterModal.css";

export const FilterModal = ({
  isOpen,
  onClose,
  onApplyFilters,
  initialFilters,
}) => {
  const { data: categories } = useCategoriesQuery();
  const { data: tags } = useTagsQuery();
  const { data: cuisines } = useCuisinesQuery();

  const [filters, setFilters] = useState({
    categories: [],
    tags: [],
    cuisines: [],
    difficulty: null,
    caloriesMin: "",
    caloriesMax: "",
    cookingTimeMin: "",
    cookingTimeMax: "",
  });

  useEffect(() => {
    if (initialFilters) {
      setFilters({
        categories: initialFilters.categories || [],
        tags: initialFilters.tags || [],
        cuisines: initialFilters.cuisines || [],
        difficulty: initialFilters.difficulty || null,
        caloriesMin: initialFilters.caloriesMin || "",
        caloriesMax: initialFilters.caloriesMax || "",
        cookingTimeMin: initialFilters.cookingTimeMin || "",
        cookingTimeMax: initialFilters.cookingTimeMax || "",
      });
    }
  }, [initialFilters, isOpen]);

  const toggleFilter = (filterType, value) => {
    setFilters((prev) => {
      const currentArray = prev[filterType] || [];
      const isSelected = currentArray.includes(value);
      return {
        ...prev,
        [filterType]: isSelected
          ? currentArray.filter((item) => item !== value)
          : [...currentArray, value],
      };
    });
  };

  const handleDifficultyChange = (difficulty) => {
    setFilters((prev) => ({
      ...prev,
      difficulty: prev.difficulty === difficulty ? null : difficulty,
    }));
  };

  const handleNumberInput = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value === "" ? "" : Math.max(0, parseInt(value) || 0),
    }));
  };

  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleReset = () => {
    setFilters({
      categories: [],
      tags: [],
      cuisines: [],
      difficulty: null,
      caloriesMin: "",
      caloriesMax: "",
      cookingTimeMin: "",
      cookingTimeMax: "",
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Фильтры рецептов"
      footer={
        <div className="filter-modal__footer">
          <Button variant="outline" onClick={handleReset}>
            Сбросить все
          </Button>
          <Button variant="primary" onClick={handleApply}>
            Применить фильтры
          </Button>
        </div>
      }
    >
      <div className="filter-modal__content">
        {/* Categories Filter */}
        <div className="filter-modal__section">
          <h3 className="filter-modal__title">Категории</h3>
          <div className="filter-modal__options">
            {categories?.map((category) => (
              <Badge
                key={category.id}
                variant={
                  filters.categories.includes(category.id)
                    ? "primary"
                    : "outline"
                }
                className="filter-modal__badge-button"
                onClick={() => toggleFilter("categories", category.id)}
                style={{ cursor: "pointer" }}
              >
                {category.name}
              </Badge>
            ))}
          </div>
        </div>

        {/* Tags Filter */}
        <div className="filter-modal__section">
          <h3 className="filter-modal__title">Теги</h3>
          <div className="filter-modal__options">
            {tags?.map((tag) => (
              <Badge
                key={tag.id}
                variant={filters.tags.includes(tag.id) ? "primary" : "outline"}
                className="filter-modal__badge-button"
                onClick={() => toggleFilter("tags", tag.id)}
                style={{ cursor: "pointer" }}
              >
                {tag.name}
              </Badge>
            ))}
          </div>
        </div>

        {/* Cuisines Filter */}
        <div className="filter-modal__section">
          <h3 className="filter-modal__title">Кухни</h3>
          <div className="filter-modal__options">
            {cuisines?.map((cuisine) => (
              <Badge
                key={cuisine.id}
                variant={
                  filters.cuisines.includes(cuisine.id) ? "primary" : "outline"
                }
                className="filter-modal__badge-button"
                onClick={() => toggleFilter("cuisines", cuisine.id)}
                style={{ cursor: "pointer" }}
              >
                {cuisine.name}
              </Badge>
            ))}
          </div>
        </div>

        {/* Difficulty Filter */}
        <div className="filter-modal__section">
          <h3 className="filter-modal__title">Сложность</h3>
          <div className="filter-modal__options">
            {[
              { value: "VERY_EASY", label: "Очень легко" },
              { value: "EASY", label: "Легко" },
              { value: "MEDIUM", label: "Средне" },
              { value: "HARD", label: "Сложно" },
              { value: "VERY_HARD", label: "Очень сложно" },
            ].map((difficulty) => (
              <Badge
                key={difficulty.value}
                variant={
                  filters.difficulty === difficulty.value
                    ? "primary"
                    : "outline"
                }
                className="filter-modal__badge-button"
                onClick={() => handleDifficultyChange(difficulty.value)}
                style={{ cursor: "pointer" }}
              >
                {difficulty.label}
              </Badge>
            ))}
          </div>
        </div>

        {/* Calories Range */}
        <div className="filter-modal__section">
          <h3 className="filter-modal__title">Калории</h3>
          <div className="filter-modal__range">
            <div className="filter-modal__range-input">
              <label>От:</label>
              <Input
                type="number"
                placeholder="Мин."
                value={filters.caloriesMin}
                onChange={(e) =>
                  handleNumberInput("caloriesMin", e.target.value)
                }
                min="0"
              />
            </div>
            <div className="filter-modal__range-input">
              <label>До:</label>
              <Input
                type="number"
                placeholder="Макс."
                value={filters.caloriesMax}
                onChange={(e) =>
                  handleNumberInput("caloriesMax", e.target.value)
                }
                min="0"
              />
            </div>
          </div>
        </div>

        {/* Cooking Time Range */}
        <div className="filter-modal__section">
          <h3 className="filter-modal__title">Время приготовления (мин)</h3>
          <div className="filter-modal__range">
            <div className="filter-modal__range-input">
              <label>От:</label>
              <Input
                type="number"
                placeholder="Мин."
                value={filters.cookingTimeMin}
                onChange={(e) =>
                  handleNumberInput("cookingTimeMin", e.target.value)
                }
                min="0"
              />
            </div>
            <div className="filter-modal__range-input">
              <label>До:</label>
              <Input
                type="number"
                placeholder="Макс."
                value={filters.cookingTimeMax}
                onChange={(e) =>
                  handleNumberInput("cookingTimeMax", e.target.value)
                }
                min="0"
              />
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
