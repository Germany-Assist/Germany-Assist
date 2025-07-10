import { Router } from "express";
import { getUserReviews } from "../controllers/userReviewController.js";
export const reviewRouter = Router();

reviewRouter.get("/:userId",getUserReviews);