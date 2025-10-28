import { body } from "express-validator";

export const createCategoryValidator = [
  body("title")
    .isString()
    .withMessage("Title must be a string")
    .isLength({ min: 3, max: 100 })
    .withMessage("Title must be between 3 and 100 characters")
    .trim(),

  body("label").isString().withMessage("Label must be a string").trim(),
];
