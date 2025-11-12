import { body, param } from "express-validator";
import hashIdUtil from "../utils/hashId.util.js";

export const createTimelineValidator = [
  param("id")
    .notEmpty()
    .withMessage("Service ID is required")
    .custom((i) => {
      const unHashed = hashIdUtil.hashIdDecode(i);
      if (!unHashed) throw new Error("invalid id");
      return true;
    })
    .withMessage("Service ID must be a valid"),
  body("label")
    .optional()
    .isString()
    .withMessage("Label must be a string")
    .isLength({ max: 100 })
    .withMessage("Label cannot exceed 100 characters")
    .matches(/^[\w\s-]*$/i)
    .withMessage(
      "Label can only contain letters, numbers, spaces, underscores, and hyphens"
    ),
];
