import express from "express";
import * as serviceController from "../controllers/service.controller.js";
import jwt from "../middlewares/jwt.middleware.js";
import { idHashedParamValidator } from "../validators/general.validators.js";
import { validateExpress } from "../middlewares/expressValidator.js";

const serviceRouter = express.Router();

/* ---------------- Public Routes ---------------- */
// Get all services that are approved & published
serviceRouter.get("/", serviceController.getAllServices);

// Get single service by ID
serviceRouter.get(
  "/:id",
  idHashedParamValidator,
  validateExpress,
  serviceController.getServiceByCreatorId
);
// Get services for a specific provider by ID (approved & published)
serviceRouter.get(
  "/provider/services/:id",
  idHashedParamValidator,
  validateExpress,
  serviceController.getServicesByServiceProviderId
);
// Get services filtered by type
serviceRouter.post("/categories", serviceController.getByCategories);
/* ---------------- Provider Routes ---------------- */
// Create a new service
serviceRouter.post("/", jwt.authenticateJwt, serviceController.createService);
// Get all services of the authenticated provider (approved or not)
serviceRouter.get(
  "/provider/services",
  jwt.authenticateJwt,
  serviceController.getAllServicesServiceProvider
);
// Update a service (allowed fields only)
serviceRouter.put(
  "/provider/services/:id",
  jwt.authenticateJwt,
  idHashedParamValidator,
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
/* ---------------- Admin Routes ---------------- */
// Get all services (any status, any provider)
serviceRouter.get(
  "/admin/services",
  jwt.authenticateJwt,
  serviceController.getAllServicesAdmin
);
// Restore a deleted service
serviceRouter.post(
  "/admin/services/:id/restore",
  jwt.authenticateJwt,
  serviceController.restoreService
);
export default serviceRouter;
