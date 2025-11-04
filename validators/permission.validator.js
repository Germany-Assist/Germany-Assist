import { body } from "express-validator";
const nameRegex = /^[a-z_]+$/i;
export const createPermissionValidator = [
  body("action")
    .trim()
    .notEmpty()
    .withMessage("Action cannot be empty")
    .isLength({ min: 2, max: 50 })
    .withMessage("Action must be between 2 and 50 characters")
    .matches(nameRegex)
    .withMessage("Action can only contain letters and underscores"),

  body("resource")
    .trim()
    .notEmpty()
    .withMessage("Resource cannot be empty")
    .isLength({ min: 2, max: 50 })
    .withMessage("Resource must be between 2 and 50 characters")
    .matches(nameRegex)
    .withMessage("Action can only contain letters and underscores"),

  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description cannot be empty")
    .isLength({ min: 5, max: 50 })
    .matches(nameRegex)
    .withMessage("Action can only contain letters and underscores"),
];
