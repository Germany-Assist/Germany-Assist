import express from "express";
import * as serviceController from "../controllers/service.controller.js";
import { authenticateJwt } from "../middlewares/jwt.middleware.js";
import {
  authorizeRequest,
  authorizeRole,
} from "../middlewares/authorize.checkpoint.js";
const serviceRouter = express.Router();

serviceRouter.post(
  "/",
  authenticateJwt,
  authorizeRole(["admin", "rep", "root"]),
  authorizeRequest("service", "create"),
  serviceController.createService
);
serviceRouter.delete("/:id", serviceController.deleteService);
serviceRouter.get("/", serviceController.getAllServices);
serviceRouter.get("/:id", serviceController.getServiceById);
serviceRouter.get("/user/:userId", serviceController.getServicesByUserId);
serviceRouter.get(
  "/business/:businessId",
  serviceController.getServicesByBusinessId
);
serviceRouter.get("/type/:type", serviceController.getServicesByType);
serviceRouter.put("/:id", serviceController.updateService);
serviceRouter.post("/:id/restore", serviceController.restoreService);
serviceRouter.put(
  "/:id/increment-views",
  serviceController.incrementServiceViews
);

export default serviceRouter;
