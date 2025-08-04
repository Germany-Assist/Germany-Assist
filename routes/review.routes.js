import express from "express";
import * as reviewController from "../controllers/review.controller.js";

const reviewRouter = express.Router();

reviewRouter.post("/", reviewController.createReview);
reviewRouter.get("/", reviewController.getAllReviews);
reviewRouter.get("/:id", reviewController.getReviewById);
reviewRouter.get("/user/:userId", reviewController.getReviewsByUserId);
reviewRouter.get("/service/:serviceId", reviewController.getReviewsByServiceId);
reviewRouter.get(
  "/service/:serviceId/average",
  reviewController.getAverageRatingForService
);
reviewRouter.put("/:id", reviewController.updateReview);
reviewRouter.delete("/:id", reviewController.deleteReview);
reviewRouter.post("/:id/restore", reviewController.restoreReview);

export default reviewRouter;
