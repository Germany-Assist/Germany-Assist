import { body, param } from "express-validator";
import hashIdUtil from "../../utils/hashId.util.js";

// Validation for creating a new service
export const createServiceValidator = [
  body("title")
    .isString()
    .withMessage("Title must be a string")
    .isLength({ min: 3, max: 50 })
    .withMessage("Title must be between 3 and 50 characters"),
  body("description")
    .isString()
    .withMessage("Description must be a string")
    .isLength({ min: 10, max: 5000 })
    .withMessage("Description must be between 10 and 5000 characters"),
  body("price")
    .isFloat({ min: 0 })
    .withMessage("Price must be a valid number and cannot be negative"),
  body("category")
    .notEmpty()
    .withMessage("Category cannot be empty")
    .isString()
    .withMessage("category must be a string"),
  body("image").optional().isURL().withMessage("Image must be a valid URL"),

  body("publish").optional().isBoolean(),
];

// Validation for updating a service
export const updateServiceValidator = [
  param("id")
    .notEmpty()
    .withMessage("Service ID param is required")
    .custom((i) => {
      const unHashed = hashIdUtil.hashIdDecode(i);
      if (!unHashed) throw new Error("invalid id");
      return true;
    }),
  ,
  body("title")
    .optional()
    .isString()
    .withMessage("Title must be a string")
    .isLength({ min: 3, max: 50 })
    .withMessage("Title must be between 3 and 50 characters"),
  body("description")
    .optional()
    .isString()
    .withMessage("Description must be a string")
    .isLength({ min: 10, max: 5000 })
    .withMessage("Description must be between 10 and 5000 characters"),
  body("image").optional().isURL().withMessage("Image must be a valid URL"),
];

export const createInquiryValidator = [
  body("id")
    .notEmpty()
    .withMessage("ID must be a valid")
    .custom((i) => {
      const unHashed = hashIdUtil.hashIdDecode(i);
      if (!unHashed) throw new Error("invalid id");
      return true;
    }),
  body("message")
    .optional()
    .isString()
    .withMessage("Description must be a string")
    .trim()
    .isLength({ min: 0, max: 5000 })
    .withMessage("Description must be between 10 and 5000 characters"),
];
