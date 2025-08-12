import { body } from "express-validator";
import db from "../database/dbIndex.js";
import { AppError } from "../utils/error.class.js";

export const createBusinessValidator = [
  // Name validation
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("Name can only contain letters and spaces"),

  // About validation
  body("about")
    .notEmpty()
    .withMessage("about is required")
    .trim()
    .isLength({ max: 200 })
    .withMessage("About cannot exceed 200 characters"),

  // Description validation
  body("description")
    .notEmpty()
    .withMessage("description is required")
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Description cannot exceed 1000 characters"),

  // Email validation
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format")
    .normalizeEmail()
    .custom(async (email) => {
      const user = await db.User.findOne({ where: { email } });
      if (user) {
        throw new AppError(
          409,
          "Email already in use",
          true,
          "Email already in use"
        );
      }
      return true;
    }),

  // Phone number validation (basic international format)
  body("phone_number")
    .optional()
    .trim()
    .matches(/^\+?[0-9\s\-\(\)]{7,20}$/)
    .withMessage("Please provide a valid phone number"),

  // Image validation (URL or base64)
  body("image")
    .optional()
    .custom((value) => {
      if (typeof value === "string") {
        if (value.match(/\.(jpeg|jpg|gif|png)$/) !== null) {
          return true;
        }
        // Check for base64 image
        if (value.startsWith("data:image")) {
          return true;
        }
      }
      throw new AppError(
        422,
        "invalid image URL or base64 string",
        true,
        "Please provide a valid image URL or base64 string"
      );
    }),

  // Password validation
  body("password")
    .trim()
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/[a-z]/)
    .withMessage("Password must contain at least one lowercase letter")
    .matches(/[0-9]/)
    .withMessage("Password must contain at least one number")
    .matches(/[^a-zA-Z0-9]/)
    .withMessage("Password must contain at least one special character")
    .escape(),
];

export const updateBusinessValidator = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("Name can only contain letters and spaces"),

  // About validation
  body("about")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("About cannot exceed 200 characters"),

  // Description validation
  body("description")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Description cannot exceed 1000 characters"),

  // Email validation
  body("email")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Invalid email format")
    .normalizeEmail()
    .custom(async (email) => {
      const user = await db.User.findOne({ where: { email } });
      if (user) {
        throw new AppError(
          409,
          "Email already in use",
          true,
          "Email already in use"
        );
      }
      return true;
    }),

  // Phone number validation (basic international format)
  body("phone_number")
    .optional()
    .trim()
    .matches(/^\+?[0-9\s\-\(\)]{7,20}$/)
    .withMessage("Please provide a valid phone number"),

  // Image validation (URL or base64)
  body("image")
    .optional()
    .custom((value) => {
      if (typeof value === "string") {
        if (value.match(/\.(jpeg|jpg|gif|png)$/) !== null) {
          return true;
        }
        // Check for base64 image
        if (value.startsWith("data:image")) {
          return true;
        }
      }
      throw new Error("Please provide a valid image URL or base64 string");
    }),
];
