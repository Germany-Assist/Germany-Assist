import { body } from "express-validator";
import hashIdUtil from "../utils/hashId.util.js";

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
export const updateCategoryValidator = [
  body("id")
    .notEmpty()
    .withMessage("ID must be a valid id")
    .custom((i) => {
      const unHashed = hashIdUtil.hashIdDecode(i);
      if (!unHashed) throw new Error("invalid id");
      return true;
    }),
  body("title")
    .trim()
    .optional()
    .isString()
    .withMessage("Title must be a string")
    .isLength({ min: 3, max: 100 })
    .withMessage("Title must be between 3 and 100 characters"),
  body("label")
    .trim()
    .optional()
    .isString()
    .withMessage("Label must be a string")
    .isLength({ min: 3, max: 300 }),
];
