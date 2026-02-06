import { body, validationResult } from "express-validator";

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  // console.log(errors);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

export const validateRegistration = [
  body("email").isEmail().normalizeEmail(),
  body("password").isLength({ min: 6 }),
  body("name").notEmpty(),
  handleValidationErrors,
];

export const validateLogin = [
  body("email").isEmail().normalizeEmail(),
  body("password").exists(),
  handleValidationErrors,
];

// Другие валидации по необходимости
