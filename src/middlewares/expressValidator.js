import { validationResult } from "express-validator";
import { AppError } from "../utils/error.class.js";

export const validateExpress = (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const err = new AppError(422, JSON.stringify(errors.array()), true, {
        errors: errors.array(),
      });
      err.appendTrace(req.requestId);
      throw err;
    }
    next();
  } catch (error) {
    next(error);
  }
};
