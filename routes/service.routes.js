import express from "express";
import * as serviceController from "../controllers/service.controller.js";
const serviceRouter = express.Router();

serviceRouter.post("/", serviceController.createService);
serviceRouter.get("/", serviceController.getAllServices);
serviceRouter.get("/:id", serviceController.getServiceById);
serviceRouter.get("/user/:userId", serviceController.getServicesByUserId);
serviceRouter.get(
  "/provider/:providerId",
  serviceController.getServicesByProviderId
);
serviceRouter.get("/type/:type", serviceController.getServicesByType);
serviceRouter.put("/:id", serviceController.updateService);
serviceRouter.delete("/:id", serviceController.deleteService);
serviceRouter.post("/:id/restore", serviceController.restoreService);
serviceRouter.put(
  "/:id/increment-views",
  serviceController.incrementServiceViews
);

export default serviceRouter;
