import express from "express";
import * as businessController from "../controllers/business.controller.js";
import { authenticateJwt } from "../middlewares/jwt.middleware.js";

import {
  createBusinessValidator,
  updateBusinessValidator,
} from "../validators/business.validators.js";
import { validateExpress } from "../middlewares/expressValidator.js";
import { authorizeRequest } from "../middlewares/authorize.checkpoint.js";
const businessRouter = express.Router();

//public
businessRouter.post(
  "/",
  createBusinessValidator,
  validateExpress,
  businessController.createBusiness
);
businessRouter.get("/", businessController.getAllBusiness);
businessRouter.get("/:id", businessController.getBusinessById);
businessRouter.put(
  "/",
  updateBusinessValidator,
  validateExpress,
  authenticateJwt,
  authorizeRequest(
    ["root", "superAdmin"],
    true,
    "business",
    "update",
    true,
    "business",
    "Business"
  ),
  businessController.updateBusiness
);
businessRouter.delete(
  "/",
  authenticateJwt,
  authorizeRequest(
    ["root", "superAdmin", "admin"],
    true,
    "business",
    "delete",
    true,
    "business",
    "Business"
  ),
  businessController.deleteBusiness
);
businessRouter.post(
  "/restore",
  authenticateJwt,
  authorizeRequest(["superAdmin", "admin"], true, "business", "restore", false),
  businessController.restoreBusiness
);

export default businessRouter;
