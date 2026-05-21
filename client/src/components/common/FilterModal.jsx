import { useState, useEffect, useMemo } from "react";
import {
  useCategoriesQuery,
  useTagsQuery,
  useCuisinesQuery,
} from "../../services/apiService";
import { Button, Input, CheckBox } from "../ui";
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

  const [categorySearch, setCategorySearch] = useState("");
  const [tagSearch, setTagSearch] = useState("");
  const [cuisineSearch, setCuisineSearch] = useState("");

  useEffect(() => {
    if (initialFilters) {
      setFilters({
        categories: initialFilters.categories || [],
        tags: initialFilters.tags || [],
        cuisines: initialFilters.cuisines || [],
        difficulty: initialFilters.difficulty || null,
        caloriesMin:
          initialFilters.caloriesMin !== null &&
          initialFilters.caloriesMin !== undefined
            ? initialFilters.caloriesMin
            : "",
        caloriesMax:
          initialFilters.caloriesMax !== null &&
          initialFilters.caloriesMax !== undefined
            ? initialFilters.caloriesMax
            : "",
        cookingTimeMin:
          initialFilters.cookingTimeMin !== null &&
          initialFilters.cookingTimeMin !== undefined
            ? initialFilters.cookingTimeMin
            : "",
        cookingTimeMax:
          initialFilters.cookingTimeMax !== null &&
          initialFilters.cookingTimeMax !== undefined
            ? initialFilters.cookingTimeMax
            : "",
      });
    }
  }, [initialFilters, isOpen]);

  const filteredCategories = useMemo(
    () =>
      categories?.filter((item) =>
        item.name.toLowerCase().includes(categorySearch.toLowerCase()),
      ) || [],
    [categories, categorySearch],
  );

  const filteredTags = useMemo(
    () =>
      tags?.filter((item) =>
        item.name.toLowerCase().includes(tagSearch.toLowerCase()),
      ) || [],
    [tags, tagSearch],
  );

  const filteredCuisines = useMemo(
    () =>
      cuisines?.filter((item) =>
        item.name.toLowerCase().includes(cuisineSearch.toLowerCase()),
      ) || [],
    [cuisines, cuisineSearch],
  );

  const toggleArrayValue = (field, value) => {
    setFilters((prev) => {
      const array = prev[field] || [];
      const next = array.includes(value)
        ? array.filter((item) => item !== value)
        : [...array, value];
      return { ...prev, [field]: next };
    });
  };

  const handleDifficultyChange = (value) => {
    setFilters((prev) => ({
      ...prev,
      difficulty: prev.difficulty === value ? null : value,
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
    setCategorySearch("");
    setTagSearch("");
    setCuisineSearch("");
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-card" role="dialog" aria-modal="true">
        <div className="modal-header">
          <div className="modal-title">Фильтры рецептов</div>
          <button className="modal-close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body filter-modal__content">
          <div className="filter-modal__section">
            <h3 className="filter-modal__title">Категории</h3>
            <Input
              type="text"
              placeholder="Поиск категории"
              value={categorySearch}
              onChange={(e) => setCategorySearch(e.target.value)}
              className="filter-modal__search-input"
            />
            <div className="filter-modal__list">
              {filteredCategories.map((category) => (
                <div key={category.id} className="filter-modal__list-item">
                  <CheckBox
                    checked={filters.categories.includes(category.id)}
                    onChange={() => toggleArrayValue("categories", category.id)}
                    label={category.name}
                  />
                </div>
              ))}
              {filteredCategories.length === 0 && (
                <div className="filter-modal__empty-state">
                  Ничего не найдено
                </div>
              )}
            </div>
          </div>

          <div className="filter-modal__section">
            <h3 className="filter-modal__title">Теги</h3>
            <Input
              type="text"
              placeholder="Поиск тега"
              value={tagSearch}
              onChange={(e) => setTagSearch(e.target.value)}
              className="filter-modal__search-input"
            />
            <div className="filter-modal__list">
              {filteredTags.map((tag) => (
                <div key={tag.id} className="filter-modal__list-item">
                  <CheckBox
                    checked={filters.tags.includes(tag.id)}
                    onChange={() => toggleArrayValue("tags", tag.id)}
                    label={tag.name}
                  />
                </div>
              ))}
              {filteredTags.length === 0 && (
                <div className="filter-modal__empty-state">
                  Ничего не найдено
                </div>
              )}
            </div>
          </div>

          <div className="filter-modal__section">
            <h3 className="filter-modal__title">Кухни</h3>
            <Input
              type="text"
              placeholder="Поиск кухни"
              value={cuisineSearch}
              onChange={(e) => setCuisineSearch(e.target.value)}
              className="filter-modal__search-input"
            />
            <div className="filter-modal__list">
              {filteredCuisines.map((cuisine) => (
                <div key={cuisine.id} className="filter-modal__list-item">
                  <CheckBox
                    checked={filters.cuisines.includes(cuisine.id)}
                    onChange={() => toggleArrayValue("cuisines", cuisine.id)}
                    label={cuisine.name}
                  />
                </div>
              ))}
              {filteredCuisines.length === 0 && (
                <div className="filter-modal__empty-state">
                  Ничего не найдено
                </div>
              )}
            </div>
          </div>

          <div className="filter-modal__section">
            <h3 className="filter-modal__title">Сложность</h3>
            <div className="filter-modal__difficulty-grid">
              {[
                { value: "VERY_EASY", label: "Очень легко" },
                { value: "EASY", label: "Легко" },
                { value: "MEDIUM", label: "Средне" },
                { value: "HARD", label: "Сложно" },
                { value: "VERY_HARD", label: "Очень сложно" },
              ].map((item) => (
                <button
                  key={item.value}
                  type="button"
                  className={`filter-modal__difficulty-pill ${
                    filters.difficulty === item.value ? "selected" : ""
                  }`}
                  onClick={() => handleDifficultyChange(item.value)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-modal__section filter-modal__range-section">
            <h3 className="filter-modal__title">Калории</h3>
            <div className="filter-modal__range">
              <div className="filter-modal__range-input">
                <label>От</label>
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
                <label>До</label>
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

          <div className="filter-modal__section filter-modal__range-section">
            <h3 className="filter-modal__title">Время приготовления (мин)</h3>
            <div className="filter-modal__range">
              <div className="filter-modal__range-input">
                <label>От</label>
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
                <label>До</label>
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

        <div className="modal-footer filter-modal__footer">
          <Button variant="outline" onClick={handleReset}>
            Сбросить все
          </Button>
          <Button variant="primary" onClick={handleApply}>
            Применить фильтры
          </Button>
        </div>
      </div>
    </div>
  );
};
