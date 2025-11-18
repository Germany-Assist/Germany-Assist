import { body, param } from "express-validator";

export const createReviewVal = [
  body("body")
    .optional({ checkFalsy: true }) // allow null/empty
    .isLength({ max: 500 })
    .withMessage("Review body cannot exceed 500 characters"),
  body("rating")
    .notEmpty()
    .withMessage("Rating is required")
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be an integer between 1 and 5"),
];
