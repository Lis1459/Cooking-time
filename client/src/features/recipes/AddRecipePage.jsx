import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Select from "react-select";
import {
  recipeService,
  ingredientService,
  useIngredientsQuery,
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

const recipeSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  cooking_time: z.coerce.number().min(1, "Cooking time must be positive"),
  calories: z.coerce.number().min(0),
  difficulty: z.enum(["VERY_EASY", "EASY", "MEDIUM", "HARD", "VERY_HARD"]),
  ingredients: z.array(
    z.object({
      ingredient_id: z.coerce.number(),
      amount: z.coerce.number().min(0.1),
      unit: z.string().min(1),
    }),
  ),
  steps: z.array(
    z.object({
      description: z.string().min(1),
      step_number: z.coerce.number(),
    }),
  ),
});

export const AddRecipePage = () => {
  const navigate = useNavigate();
  // const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);
  const [error, setError] = useState(null);

  console.log("image", image);

  const { data: ingredients, isLoading: ingredientsLoading } =
    useIngredientsQuery();

  const options =
    ingredients?.map((i) => ({
      value: i.id,
      label: i.name,
    })) || [];

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(recipeSchema),
    defaultValues: {
      difficulty: "MEDIUM",
      ingredients: [{ ingredient_id: "", amount: "", unit: "g" }],
      steps: [{ description: "", step_number: 1 }],
    },
  });
  console.log(ingredients);

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
    try {
      setLoading(true);
      const formData = new FormData();

      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("cooking_time", data.cooking_time);
      formData.append("calories", data.calories);
      formData.append("difficulty", data.difficulty);

      if (image) {
        formData.append("preview_image", image);
      }

      formData.append("ingredients", JSON.stringify(data.ingredients));
      formData.append("steps", JSON.stringify(data.steps));

      const response = await recipeService.createRecipe(formData);
      navigate(`/recipes/${response.id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create recipe");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-recipe-page">
      <Card>
        <CardHeader>Add New Recipe</CardHeader>
        <CardContent>
          {error && <Alert variant="error">{error}</Alert>}

          <form onSubmit={handleSubmit(onSubmit)} className="recipe-form">
            {/* Basic Info */}
            <div className="form-section">
              <h3>Recipe Information</h3>

              <div className="form-group">
                <Label htmlFor="title">Recipe Title *</Label>
                <Input
                  id="title"
                  placeholder="Enter recipe title"
                  {...register("title")}
                  error={!!errors.title}
                />
                {errors.title && (
                  <span className="error-message">{errors.title.message}</span>
                )}
              </div>

              <div className="form-group">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your delicious recipe..."
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

              <div className="form-row">
                <div className="form-group">
                  <Label htmlFor="cooking_time">Cooking Time (minutes) *</Label>
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
                  <Label htmlFor="calories">Calories (per serving) *</Label>
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
                  <Label htmlFor="difficulty">Difficulty Level *</Label>
                  <select {...register("difficulty")} className="select">
                    <option value="VERY_EASY">Very Easy</option>
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                    <option value="VERY_HARD">Very Hard</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <Label htmlFor="preview_image">Recipe Image</Label>
                <input
                  id="preview_image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files?.[0])}
                  className="file-input"
                />
              </div>
            </div>

            {/* Ingredients */}
            <div className="form-section">
              <h3>Ingredients</h3>
              <div className="array-section">
                {ingredientFields.map((field, index) => (
                  <div key={field.id} className="array-item">
                    <div className="form-row">
                      <div className="form-group" style={{ flex: 2 }}>
                        <Label>Ingredient Name</Label>
                        {/* <Input
                          placeholder="e.g., Flour"
                          {...register(`ingredients.${index}.ingredient_id`)}
                          error={!!errors.ingredients?.[index]?.ingredient_id}
                        /> */}
                        <Controller
                          name={`ingredients.${index}.ingredient_id`}
                          control={control}
                          rules={{ required: "Ingredient is required" }}
                          render={({ field }) => (
                            <Select
                              options={options}
                              value={
                                options.find((o) => o.value === field.value) ||
                                null
                              }
                              onChange={(selected) =>
                                field.onChange(selected.value)
                              }
                              placeholder="Select an ingredient"
                              isLoading={ingredientsLoading}
                            />
                          )}
                        />
                      </div>
                      <div className="form-group">
                        <Label>Amount</Label>
                        <Input
                          type="number"
                          step="0.1"
                          {...register(`ingredients.${index}.amount`)}
                          error={!!errors.ingredients?.[index]?.amount}
                        />
                      </div>
                      <div className="form-group">
                        <Label>Unit</Label>
                        <Input
                          placeholder="g, ml, cup"
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
                          Remove
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
                  appendIngredient({ ingredient_id: "", amount: "", unit: "g" })
                }
                type="button"
              >
                + Add Ingredient
              </Button>
            </div>

            {/* Cooking Steps */}
            <div className="form-section">
              <h3>Cooking Steps</h3>
              <div className="array-section">
                {stepFields.map((field, index) => (
                  <div key={field.id} className="array-item">
                    <Label>Step {index + 1}</Label>
                    <Textarea
                      placeholder="Describe this cooking step..."
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
                        Remove Step
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
                + Add Step
              </Button>
            </div>

            {/* Submit Buttons */}
            <div className="form-actions">
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? "Publishing..." : "Publish Recipe"}
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/recipes")}
                type="button"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddRecipePage;
