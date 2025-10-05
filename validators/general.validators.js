import { body, param } from "express-validator";
import hashIdUtil from "../utils/hashId.util.js";
export const passwordValidator = [
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

// Validation for ID-based routes
export const idHashedParamValidator = [
  param("id")
    .notEmpty()
    .withMessage("ID must be a valid")
    .custom((i) => {
      const unHashed = hashIdUtil.hashIdDecode(i);
      if (!unHashed) throw new Error("invalid id");
      return true;
    }),
];
export const idHashedBodyValidator = [
  body("id")
    .notEmpty()
    .withMessage("ID must be a valid")
    .custom((i) => {
      const unHashed = hashIdUtil.hashIdDecode(i);
      if (!unHashed) throw new Error("invalid id");
      return true;
    }),
];
