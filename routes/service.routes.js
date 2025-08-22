import express from "express";
import * as serviceController from "../controllers/service.controller.js";
import jwt from "../middlewares/jwt.middleware.js";
const serviceRouter = express.Router();

serviceRouter.post("/", jwt.authenticateJwt, serviceController.createService);
serviceRouter.get("/", serviceController.getAllServices);
serviceRouter.put(
  "/update",
  jwt.authenticateJwt,
  serviceController.updateService
);
serviceRouter.get("/type/:type", serviceController.getServicesByType);
serviceRouter.get("/:id", serviceController.getServiceById);
serviceRouter.delete("/", jwt.authenticateJwt, serviceController.deleteService);
serviceRouter.post(
  "/restore",
  jwt.authenticateJwt,
  serviceController.restoreService
);
serviceRouter.put(
  "/:id/increment-views",
  serviceController.incrementServiceViews
);
serviceRouter.get(
  "/admin",
  jwt.authenticateJwt,
  serviceController.getAllServicesAdmin
);
serviceRouter.get(
  "/business/:id",
  jwt.authenticateJwt,
  serviceController.getServicesByBusinessId
);
export default serviceRouter;
