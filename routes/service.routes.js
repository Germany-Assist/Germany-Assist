import express from "express";
import * as serviceController from "../controllers/service.controller.js";
import jwt from "../middlewares/jwt.middleware.js";
const serviceRouter = express.Router();

serviceRouter.post("/", jwt.authenticateJwt, serviceController.createService);
serviceRouter.get("/", serviceController.getAllServices);
serviceRouter.get("/id/:id", serviceController.getServiceById);
//get all the service for a business public
serviceRouter.get(
  "/business/id/:id",
  serviceController.getServicesByBusinessId
);
serviceRouter.get(
  "/business/private",
  jwt.authenticateJwt,
  serviceController.getAllServicesBusiness
);
serviceRouter.get(
  "/admin",
  jwt.authenticateJwt,
  serviceController.getAllServicesAdmin
);
serviceRouter.delete("/", jwt.authenticateJwt, serviceController.deleteService);

serviceRouter.post(
  "/restore",
  jwt.authenticateJwt,
  serviceController.restoreService
);

serviceRouter.put(
  "/update",
  jwt.authenticateJwt,
  serviceController.updateService
);

//get all services by type
//will be discussed further
// serviceRouter.get("/type/:type", serviceController.getServicesByType);
export default serviceRouter;
