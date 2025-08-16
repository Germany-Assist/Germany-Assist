import express from "express";
import * as businessController from "../controllers/business.controller.js";
import { authenticateJwt } from "../middlewares/jwt.middleware.js";
import {
  authorizeOwnership,
  authorizeRequest,
  authorizeRole,
} from "../middlewares/authorize.checkpoint.js";
import {
  createBusinessValidator,
  updateBusinessValidator,
} from "../validators/business.validators.js";
import { validateExpress } from "../middlewares/expressValidator.js";
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
  "/:id",
  updateBusinessValidator,
  validateExpress,
  authenticateJwt,
  authorizeRole(["root", "rep"]),
  authorizeRequest("business", "update"),
  businessController.updateBusiness
);
//private root only
businessRouter.delete(
  "/:id",
  authenticateJwt,
  authorizeRole(["root"]),
  businessController.deleteBusiness
);
//private root only
businessRouter.post(
  "/:id/restore",
  authenticateJwt,
  authorizeRole(["admin"]),
  businessController.restoreBusiness
);

export default businessRouter;
