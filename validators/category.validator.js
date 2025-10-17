import { body } from "express-validator";

export const createCategoryValidator = [
  body("title")
    .isString()
    .withMessage("Title must be a string")
    .isLength({ min: 3, max: 100 })
    .withMessage("Title must be between 3 and 100 characters")
    .trim(),

  body("label").isString().withMessage("Label must be a string").trim(),

  body("contract_template")
    .isString()
    .withMessage("Contract template must be a string")
    .isLength({ min: 10 })
    .withMessage("Contract template must be at least 10 characters long"),

  body("variables")
    .isArray({ min: 1 })
    .withMessage("Variables must be a non-empty array")
    .custom((arr) => arr.every((v) => typeof v === "string" && v.trim() !== ""))
    .withMessage("Each variable must be a non-empty string"),
];
export const updateContractValidator = [
  body("contract_template")
    .isString()
    .withMessage("Contract template must be a string")
    .isLength({ min: 10 })
    .withMessage("Contract template must be at least 10 characters long"),

  body("variables")
    .isArray({ min: 1 })
    .withMessage("Variables must be a non-empty array")
    .custom((arr) => arr.every((v) => typeof v === "string" && v.trim() !== ""))
    .withMessage("Each variable must be a non-empty string"),
];
