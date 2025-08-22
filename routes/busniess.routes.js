import express from "express";
import * as businessController from "../controllers/business.controller.js";
import jwt from "../middlewares/jwt.middleware.js";
import {
  createBusinessValidator,
  updateBusinessValidator,
} from "../validators/business.validators.js";
import { validateExpress } from "../middlewares/expressValidator.js";
const businessRouter = express.Router();

businessRouter.get("/", businessController.getAllBusiness);
businessRouter.get("/:id", businessController.getBusinessById);
businessRouter.delete(
  "/",
  jwt.authenticateJwt,
  businessController.deleteBusiness
);
businessRouter.put(
  "/",
  updateBusinessValidator,
  validateExpress,
  jwt.authenticateJwt,
  businessController.updateBusiness
);
businessRouter.post(
  "/",
  createBusinessValidator,
  validateExpress,
  businessController.createBusiness
);
businessRouter.post(
  "/restore",
  jwt.authenticateJwt,
  businessController.restoreBusiness
);

export default businessRouter;
