import { validationResult } from "express-validator";
import { AppError } from "../utils/error.class.js";

export const validateExpress = (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError(422, JSON.stringify(errors.array()), true, {
        errors: errors.array(),
      });
    }
    next();
  } catch (error) {
    next(error);
  }
};
