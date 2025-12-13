import express from "express";
import categoryController from "../controllers/category.controller.js";
import jwt from "../middlewares/jwt.middleware.js";
import {
  createCategoryValidator,
  updateCategoryValidator,
} from "../validators/category.validator.js";
import { validateExpress } from "../middlewares/expressValidator.js";

const categoryRouter = express.Router();

categoryRouter.post(
  "/",
  jwt.authenticateJwt,
  createCategoryValidator,
  validateExpress,
  categoryController.createCategory
);
categoryRouter.put(
  "/",
  jwt.authenticateJwt,
  updateCategoryValidator,
  validateExpress,
  categoryController.updateCategory
);

categoryRouter.get("/", categoryController.getAllCategories);

export default categoryRouter;
