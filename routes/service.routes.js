import express from "express";
import serviceController from "../controllers/service.controller.js";
import jwt from "../middlewares/jwt.middleware.js";
import {
  idHashedBodyValidator,
  idHashedParamValidator,
} from "../validators/general.validators.js";
import { validateExpress } from "../middlewares/expressValidator.js";
import { createServiceValidator } from "../validators/services.validators.js";
import timelineRouter from "./timeline.routes.js";

const serviceRouter = express.Router();
serviceRouter.use("/timeline", timelineRouter);
/* ---------------- Public Routes ---------------- */
// Get all services that are approved & published
serviceRouter.get("/", serviceController.getAllServices);
//service profile
serviceRouter.get(
  "/:id",
  idHashedParamValidator,
  validateExpress,
  serviceController.getServiceProfile
);
/* ---------------- Provider Routes ---------------- */
// Create a new service
serviceRouter.post(
  "/",
  jwt.authenticateJwt,
  createServiceValidator,
  validateExpress,
  serviceController.createService
);
// Get all services of the authenticated provider (approved or not)
serviceRouter.get(
  "/provider/services",
  jwt.authenticateJwt,
  serviceController.getAllServicesSP
);
serviceRouter.get(
  "/provider/services/:id",
  jwt.authenticateJwt,
  serviceController.getServiceProfilePrivate
);
// Update a service (allowed fields only)
serviceRouter.put(
  "/provider/services",
  jwt.authenticateJwt,
  idHashedBodyValidator,
  validateExpress,
  serviceController.updateService
);
// Delete a service (soft delete)
serviceRouter.delete(
  "/provider/services/:id",
  idHashedParamValidator,
  validateExpress,
  jwt.authenticateJwt,
  serviceController.deleteService
);
serviceRouter.put(
  "/provider/services/status",
  jwt.authenticateJwt,
  serviceController.alterServiceStatusSP
);
/* ---------------- Admin Routes ---------------- */
// Get all services (any status, any provider)
serviceRouter.get(
  "/admin/services",
  jwt.authenticateJwt,
  serviceController.getAllServicesAdmin
);
serviceRouter.get(
  "/admin/services/:id",
  jwt.authenticateJwt,
  serviceController.getServiceProfilePrivate
);
// Restore a deleted service
serviceRouter.post(
  "/admin/services/:id/restore",
  jwt.authenticateJwt,
  idHashedParamValidator,
  validateExpress,
  serviceController.restoreService
);
serviceRouter.put(
  "/admin/services/status",
  jwt.authenticateJwt,
  serviceController.alterServiceStatus
);

/*------------------- Client Routes ----------------*/
// add to favorite
serviceRouter.put(
  "/client/favorite/:id",
  jwt.authenticateJwt,
  validateExpress,
  serviceController.addToFavorite
);
//remove from favorite
serviceRouter.delete(
  "/client/favorite/:id",
  jwt.authenticateJwt,
  validateExpress,
  serviceController.removeFromFavorite
);

export default serviceRouter;
