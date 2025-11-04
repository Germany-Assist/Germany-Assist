import express from "express";
import reviewController from "../controllers/review.controller.js";
import { validateExpress } from "../middlewares/expressValidator.js";
import { createReviewVal } from "../validators/review.validators.js";
import jwtMiddleware from "../middlewares/jwt.middleware.js";
import { idHashedParamValidator } from "../validators/general.validators.js";

const reviewRouter = express.Router();

reviewRouter.post(
  "/",
  createReviewVal,
  validateExpress,
  jwtMiddleware.authenticateJwt,
  reviewController.createReview
);
reviewRouter.get(
  "/service/:id",
  idHashedParamValidator,
  validateExpress,
  reviewController.getReviewsByServiceId
);
reviewRouter.put(
  "/service/:id",
  createReviewVal,
  idHashedParamValidator,
  validateExpress,
  jwtMiddleware.authenticateJwt,
  reviewController.updateReview
);

export default reviewRouter;
