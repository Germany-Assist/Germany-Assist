import { body } from "express-validator";
import hashIdUtil from "../utils/hashId.util.js";
const nameRegex = /^[a-z_]+$/i;
export const createPermissionValidator = [
  body("id")
    .notEmpty()
    .withMessage("ID must be a valid")
    .custom((i) => {
      const unHashed = hashIdUtil.hashIdDecode(i);
      if (!unHashed) throw new Error("invalid id");
      return true;
    }),

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
];
