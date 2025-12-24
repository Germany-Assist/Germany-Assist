import express from "express";
import reviewController from "./review.controller.js";
import { validateExpress } from "../../middlewares/expressValidator.js";
import { createReviewVal } from "./review.validators.js";
import jwtMiddleware from "../../middlewares/jwt.middleware.js";
import { idHashedParamValidator } from "../../validators/general.validators.js";

const reviewRouter = express.Router();

reviewRouter.post(
  "/",
  createReviewVal,
  validateExpress,
  jwtMiddleware.authenticateJwt,
  reviewController.createReview
);

reviewRouter.put(
  "/",
  createReviewVal,
  validateExpress,
  jwtMiddleware.authenticateJwt,
  reviewController.updateReview
);

export default reviewRouter;
