import { body } from "express-validator";

export const createCategoryValidator = [
  body("title")
    .trim()
    .isString()
    .withMessage("Title must be a string")
    .isLength({ min: 3, max: 100 })
    .withMessage("Title must be between 3 and 100 characters"),
  body("label")
    .trim()
    .isString()
    .withMessage("Label must be a string")
    .isLength({ min: 3, max: 300 }),
];
