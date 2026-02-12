export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const validatePassword = (password, minLength = 6) => {
  return password && password.length >= minLength;
};

export const validateRecipeTitle = (title, minLength = 3) => {
  return title && title.trim().length >= minLength;
};

export const validateRecipeDescription = (description, minLength = 10) => {
  return description && description.trim().length >= minLength;
};

export const validateIngredient = (ingredient) => {
  return (
    ingredient &&
    ingredient.ingredient_id &&
    ingredient.amount &&
    ingredient.amount > 0 &&
    ingredient.unit
  );
};

export const validateRecipeStep = (step) => {
  return step && step.description && step.description.trim().length > 0;
};

export const sanitizeInput = (input) => {
  if (typeof input !== "string") return input;
  return input.replace(/[<>]/g, "").trim();
};

export default {
  validateEmail,
  validatePassword,
  validateRecipeTitle,
  validateRecipeDescription,
  validateIngredient,
  validateRecipeStep,
  sanitizeInput,
};
