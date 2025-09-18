import { body } from "express-validator";

export const createReviewVal = [
  body("body")
    .optional({ checkFalsy: true }) // allow null/empty
    .isLength({ max: 2000 })
    .withMessage("Review body cannot exceed 2000 characters"),
  body("rating")
    .notEmpty()
    .withMessage("Rating is required")
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be an integer between 1 and 5"),
  body("id").notEmpty().withMessage("Id is required"),
];
