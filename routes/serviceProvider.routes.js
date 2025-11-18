import express from "express";
import serviceProviderController from "../controllers/serviceProvider.controller.js";
import jwt from "../middlewares/jwt.middleware.js";
import { validateExpress } from "../middlewares/expressValidator.js";
import {
  createServiceProviderValidator,
  updateServiceProviderValidator,
} from "../validators/serviceProvider.validators.js";
import { idUUIDparamValidator } from "../validators/general.validators.js";
const serviceProviderRouter = express.Router();

serviceProviderRouter.get("/", serviceProviderController.getAllServiceProvider);
serviceProviderRouter.get(
  "/:id",
  idUUIDparamValidator,
  validateExpress,
  serviceProviderController.getServiceProviderById
);
serviceProviderRouter.delete(
  "/:id",
  idUUIDparamValidator,
  validateExpress,
  jwt.authenticateJwt,
  serviceProviderController.deleteServiceProvider
);
serviceProviderRouter.put(
  "/",
  updateServiceProviderValidator,
  validateExpress,
  jwt.authenticateJwt,
  serviceProviderController.updateServiceProvider
);
serviceProviderRouter.post(
  "/",
  createServiceProviderValidator,
  validateExpress,
  serviceProviderController.createServiceProvider
);
serviceProviderRouter.get(
  "/restore/:id",
  idUUIDparamValidator,
  validateExpress,
  jwt.authenticateJwt,
  serviceProviderController.restoreServiceProvider
);

export default serviceProviderRouter;
