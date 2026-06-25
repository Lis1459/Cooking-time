import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import CreatableSelect from "react-select/creatable";
import {
  useCreateRecipeMutation,
  useIngredientsQuery,
  useRecipeQuery,
  useUpdateRecipeMutation,
  useCategoriesQuery,
  useTagsQuery,
  useCuisinesQuery,
} from "../../services/apiService";
import {
  Button,
  Input,
  Textarea,
  Label,
  Card,
  CardHeader,
  CardContent,
  Alert,
  Loader,
} from "../../components/ui";
import "./RecipeForm.css";
import { SOCKET_URL } from "../../config/constants";
import { RecipeDifficulty } from "./../../utils/recipeConst";

const recipeSchema = z.object({
  title: z.string().min(3, "Название должно быть хотябы 3 символа"),
  description: z
    .string()
    .min(10, "Описание должно содержать не менее 10 символов"),
  cooking_time: z.coerce
    .number()
    .min(1, "Время приготовления должно быть положительным"),
  calories: z.coerce.number().min(0),
  difficulty: z.enum(["VERY_EASY", "EASY", "MEDIUM", "HARD", "VERY_HARD"]),
  image: z.instanceof(File, "Изображения обязательно для загрузки"),
  ingredients: z.array(
    z.object({
      ingredient_id: z.number().optional(),
      ingredient_name: z.string().min(1, "Название ингредиента обязательно"),
      amount: z.coerce.number().min(0.1, "Количество должно быть больше нуля"),
      unit: z.string().min(1, "Единица измерения обязательна"),
    }),
  ),
  steps: z.array(
    z.object({
      description: z.string().min(1, "Описание шага обязательно"),
      step_number: z.coerce.number(),
    }),
  ),
  categories: z.array(z.number()).optional(),
  tags: z.array(z.number()).optional(),
  cuisines: z.array(z.number()).optional(),
});

const customStyles = {
  control: (base, state) => ({
    ...base,
    padding: "3px",

    borderRadius: "var(--border-radius-md)",
    borderColor: state.isFocused ? "var(--primary)" : "var(--gray-200)",
    boxShadow: state.isFocused ? "0 0 0 3px rgba(239, 68, 68, 0.1)" : "none",
    "&:hover": {
      borderColor: state.isFocused ? "var(--primary)" : "var(--gray-400)",
    },
    minHeight: "45px",
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? "var(--primary)"
      : state.isFocused
        ? "var(--gray-100)"
        : "white",
    ":active": {
      backgroundColor: "var(--primary)",
      color: "white",
      opacity: 0.8,
    },
    color: state.isSelected ? "white" : "var(--gray-900)",
    cursor: "pointer",
  }),
  multiValue: (base) => ({
    ...base,
    borderRadius: "3px",
  }),
  // multiValueLabel: (base) => ({
  //   ...base,
  //   color: "var(--primary)",
  //   fontSize: "13px",
  // }),
  multiValueRemove: (base) => ({
    ...base,
    ":hover": {
      backgroundColor: "rgb(194, 194, 194)",
    },
  }),
  menu: (base) => ({
    ...base,
    borderRadius: "var(--border-radius-md)",
    overflow: "hidden",
  }),
};

export const AddRecipePage = () => {
  const navigate = useNavigate();
  // const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const createRecipeMutation = useCreateRecipeMutation();
  const { id } = useParams();
  const updateRecipeMutation = useUpdateRecipeMutation(id);

  const { data: recipeData, isLoading: recipeLoading } = useRecipeQuery(
    id,
    {},
    { enabled: !!id },
  );

  const { data: categories } = useCategoriesQuery();
  const { data: tags } = useTagsQuery();
  const { data: cuisines } = useCuisinesQuery();

  const { data: ingredients, isLoading: ingredientsLoading } =
    useIngredientsQuery({ status: "Verified" });

  const options =
    ingredients?.map((i) => ({
      value: i.id,
      label: i.name,
    })) || [];

  const categoryOptions =
    categories?.map((c) => ({ value: c.id, label: c.name })) || [];
  const tagOptions = tags?.map((t) => ({ value: t.id, label: t.name })) || [];
  const cuisineOptions =
    cuisines?.map((c) => ({ value: c.id, label: c.name })) || [];

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(recipeSchema),
    defaultValues: {
      calories: 0,
      difficulty: "MEDIUM",
      ingredients: [
        {
          ingredient_id: undefined,
          ingredient_name: "",
          amount: "",
          unit: "г",
        },
      ],
      steps: [{ description: "", step_number: 1 }],
    },
  });
  console.log("errors: ", errors);

  const urlToFile = async (url, filename = "image.jpg") => {
    const response = await fetch(url);
    const blob = await response.blob();

    return new File([blob], filename, {
      type: blob.type,
    });
  };

  useEffect(() => {
    console.log("recipesData ", recipeData);
    const prepareData = async () => {
      if (!recipeData) return;

      let imageFile = null;

      if (recipeData.preview_img_url) {
        const fullUrl = `${SOCKET_URL}${recipeData.preview_img_url}`;
        imageFile = await urlToFile(fullUrl, "recipe.jpg");
      }
      // map recipe data to form fields
      const mapped = {
        title: recipeData.title,
        description: recipeData.description,
        cooking_time: recipeData.cooking_time,
        calories: recipeData.calories,
        difficulty: recipeData.difficulty,
        image: imageFile,
        ingredients: (recipeData.ingredients || []).map((ing) => ({
          ingredient_id: ing.ingredient?.id,
          ingredient_name: ing.ingredient?.name,
          amount: ing.amount,
          unit: ing.unit,
        })),
        steps: (recipeData.steps || []).map((s, idx) => ({
          description: s.description,
          step_number: s.step_number ?? idx + 1,
        })),
        categories: (recipeData.categories || []).map((c) => c.id),
        tags: (recipeData.tags || []).map((t) => t.id),
        cuisines: (recipeData.cuisines || []).map((c) => c.id),
      };

      // reset form
      reset(mapped);
    };

    prepareData();
  }, [recipeData]);

  const {
    fields: ingredientFields,
    append: appendIngredient,
    remove: removeIngredient,
  } = useFieldArray({
    control,
    name: "ingredients",
  });

  const {
    fields: stepFields,
    append: appendStep,
    remove: removeStep,
  } = useFieldArray({
    control,
    name: "steps",
  });

  const onSubmit = async (data) => {
    console.log("Data: ", data);
    try {
      setLoading(true);
      const formData = new FormData();

      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("cooking_time", data.cooking_time);
      formData.append("calories", data.calories);
      formData.append("difficulty", data.difficulty);

      formData.append("preview_image", data.image);

      formData.append("ingredients", JSON.stringify(data.ingredients));
      formData.append("steps", JSON.stringify(data.steps));
      if (data.categories) {
        formData.append("categories", JSON.stringify(data.categories));
      }
      if (data.tags) {
        formData.append("tags", JSON.stringify(data.tags));
      }
      if (data.cuisines) {
        formData.append("cuisines", JSON.stringify(data.cuisines));
      }

      let response;
      if (id) {
        response = await updateRecipeMutation.mutateAsync(formData);
        toast.success("Изменения в рецепте отправлены на модерацию!");
      } else {
        response = await createRecipeMutation.mutateAsync(formData);
      }
      navigate(`/recipes/${response.id || (id ? id : response.id)}`);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Не удалось создать рецепт";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-recipe-page">
      <Card>
        <CardHeader>
          {id ? "Редактировать рецепт" : "Добавить рецепт"}
        </CardHeader>
        <CardContent>
          {error && <Alert variant="error">{error}</Alert>}

          <form onSubmit={handleSubmit(onSubmit)} className="recipe-form">
            {/* Basic Info */}
            <div className="form-section">
              <h3>Информация о рецепте</h3>

              <div className="form-group">
                <Label htmlFor="title">Название рецепта *</Label>
                <Input
                  id="title"
                  placeholder="Введите название рецепта"
                  {...register("title")}
                  error={!!errors.title}
                />
                {errors.title && (
                  <span className="error-message">{errors.title.message}</span>
                )}
              </div>

              <div className="form-group">
                <Label htmlFor="description">Описание *</Label>
                <div>
                  <Textarea
                    id="description"
                    placeholder="Опишите ваш вкусный рецепт..."
                    rows={4}
                    {...register("description")}
                    error={!!errors.description}
                  />
                  {errors.description && (
                    <span className="error-message">
                      {errors.description.message}
                    </span>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <Label htmlFor="cooking_time">
                    Время приготовления (мин) *
                  </Label>
                  <Input
                    id="cooking_time"
                    type="number"
                    min="1"
                    {...register("cooking_time")}
                    error={!!errors.cooking_time}
                  />
                  {errors.cooking_time && (
                    <span className="error-message">
                      {errors.cooking_time.message}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <Label htmlFor="calories">Калории (на порцию) *</Label>
                  <Input
                    id="calories"
                    type="number"
                    min="0"
                    {...register("calories")}
                    error={!!errors.calories}
                  />
                  {errors.calories && (
                    <span className="error-message">
                      {errors.calories.message}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <Label htmlFor="difficulty">Уровень сложности *</Label>
                  <select {...register("difficulty")} className="select">
                    <option value="VERY_EASY">
                      {RecipeDifficulty.VERY_EASY}
                    </option>
                    <option value="EASY">{RecipeDifficulty.EASY}</option>
                    <option value="MEDIUM">{RecipeDifficulty.MEDIUM}</option>
                    <option value="HARD">{RecipeDifficulty.HARD}</option>
                    <option value="VERY_HARD">
                      {RecipeDifficulty.VERY_HARD}
                    </option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <Label htmlFor="preview_image">Фото рецепта *</Label>
                <Controller
                  name="image"
                  control={control}
                  render={({ field }) => (
                    <input
                      id="preview_image"
                      type="file"
                      accept="image/*"
                      onChange={(e) => field.onChange(e.target.files?.[0])}
                      className="file-input"
                    />
                  )}
                />
                {errors.image && (
                  <span className="error-message">{errors.image.message}</span>
                )}
              </div>

              <div className="form-group">
                <Label>Категории</Label>
                <Controller
                  name="categories"
                  control={control}
                  render={({ field }) => (
                    <CreatableSelect
                      isMulti
                      styles={customStyles}
                      placeholder="Выберите категории"
                      options={categoryOptions}
                      value={categoryOptions.filter((o) =>
                        (field.value || []).includes(o.value),
                      )}
                      onChange={(selected) =>
                        field.onChange((selected || []).map((s) => s.value))
                      }
                    />
                  )}
                />
              </div>

              <div className="form-group">
                <Label>Теги</Label>
                <Controller
                  name="tags"
                  control={control}
                  render={({ field }) => (
                    <CreatableSelect
                      isMulti
                      styles={customStyles}
                      placeholder="Выберите теги"
                      options={tagOptions}
                      value={tagOptions.filter((o) =>
                        (field.value || []).includes(o.value),
                      )}
                      onChange={(selected) =>
                        field.onChange((selected || []).map((s) => s.value))
                      }
                    />
                  )}
                />
              </div>

              <div className="form-group">
                <Label>Кухни</Label>
                <Controller
                  name="cuisines"
                  control={control}
                  render={({ field }) => (
                    <CreatableSelect
                      isMulti
                      styles={customStyles}
                      placeholder="Выберите кухни"
                      options={cuisineOptions}
                      value={cuisineOptions.filter((o) =>
                        (field.value || []).includes(o.value),
                      )}
                      onChange={(selected) =>
                        field.onChange((selected || []).map((s) => s.value))
                      }
                    />
                  )}
                />
              </div>
            </div>

            {/* Ingredients */}
            <div className="form-section">
              <h3>Ингредиенты</h3>
              <div className="array-section">
                {ingredientFields.map((field, index) => (
                  <div key={field.id} className="array-item">
                    <div className="form-row">
                      <div className="form-group" style={{ flex: 2 }}>
                        <Label>Название ингредиента</Label>
                        {/* <Input
                          placeholder="e.g., Flour"
                          {...register(`ingredients.${index}.ingredient_id`)}
                          error={!!errors.ingredients?.[index]?.ingredient_id}
                        /> */}
                        <Controller
                          name={`ingredients.${index}`}
                          control={control}
                          rules={{
                            validate: (value) =>
                              value?.ingredient_name || "Ингредиент обязателен",
                          }}
                          render={({ field }) => {
                            const value = field.value || {};
                            const selectedOption = value.ingredient_id
                              ? {
                                  value: value.ingredient_id,
                                  label: value.ingredient_name,
                                }
                              : value.ingredient_name
                                ? {
                                    value: value.ingredient_name,
                                    label: value.ingredient_name,
                                  }
                                : null;

                            return (
                              <>
                                <CreatableSelect
                                  styles={customStyles}
                                  options={options}
                                  value={selectedOption}
                                  onChange={(selected) => {
                                    if (!selected) {
                                      field.onChange({
                                        ingredient_id: undefined,
                                        ingredient_name: "",
                                      });
                                      return;
                                    }

                                    const isNew = selected.__isNew__;
                                    const selectedValue = selected.value;

                                    field.onChange({
                                      ingredient_id: isNew
                                        ? undefined
                                        : Number(selectedValue),
                                      ingredient_name:
                                        selected.label || selectedValue,
                                    });
                                  }}
                                  formatCreateLabel={(inputValue) =>
                                    `Добавить "${inputValue}"`
                                  }
                                  placeholder="Выберите ингредиент"
                                  isClearable
                                  isLoading={ingredientsLoading}
                                />
                                {errors.ingredients?.[index]
                                  ?.ingredient_name && (
                                  <span className="error-message">
                                    {
                                      errors.ingredients[index].ingredient_name
                                        .message
                                    }
                                  </span>
                                )}
                              </>
                            );
                          }}
                        />
                      </div>
                      <div className="form-group">
                        <Label>Количество</Label>
                        <Input
                          type="number"
                          step="0.1"
                          {...register(`ingredients.${index}.amount`)}
                          error={!!errors.ingredients?.[index]?.amount}
                        />
                      </div>
                      <div className="form-group">
                        <Label>Единица измерения</Label>
                        <Input
                          placeholder="г, мл, шт"
                          {...register(`ingredients.${index}.unit`)}
                          error={!!errors.ingredients?.[index]?.unit}
                        />
                      </div>
                      <div className="form-group-action">
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => removeIngredient(index)}
                          type="button"
                        >
                          Удалить
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  appendIngredient({
                    ingredient_id: undefined,
                    ingredient_name: "",
                    amount: "",
                    unit: "г",
                  })
                }
                type="button"
              >
                + Добавить ингредиент
              </Button>
            </div>

            {/* Cooking Steps */}
            <div className="form-section">
              <h3>Этапы приготовления</h3>
              <div className="array-section">
                {stepFields.map((field, index) => (
                  <div key={field.id} className="array-item">
                    <Label>Этап {index + 1}</Label>
                    <Textarea
                      placeholder="Опишите этот шаг приготовления..."
                      rows={2}
                      {...register(`steps.${index}.description`)}
                      error={!!errors.steps?.[index]?.description}
                    />
                    {stepFields.length > 1 && (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => removeStep(index)}
                        type="button"
                        style={{ marginTop: "var(--spacing-md)" }}
                      >
                        Удалить шаг
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  appendStep({
                    description: "",
                    step_number: stepFields.length + 1,
                  })
                }
                type="button"
              >
                + Добавить шаг
              </Button>
            </div>

            {/* Submit Buttons */}
            <div className="form-actions">
              <Button variant="success" type="submit" disabled={loading}>
                {loading
                  ? id
                    ? "Сохранение..."
                    : "Публикация..."
                  : id
                    ? "Сохранить изменения"
                    : "Опубликовать рецепт"}
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/recipes")}
                type="button"
              >
                Отмена
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddRecipePage;
