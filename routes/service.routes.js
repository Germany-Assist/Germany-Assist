import express from "express";
import * as serviceController from "../controllers/service.controller.js";
import { authenticateJwt } from "../middlewares/jwt.middleware.js";
import { authorizeRequest } from "../middlewares/authorize.checkpoint.js";
const serviceRouter = express.Router();

serviceRouter.post(
  "/",
  authenticateJwt,
  authorizeRequest(["root", "rep", "superAdmin"], true, "service", "create"),
  serviceController.createService
);
serviceRouter.get("/", serviceController.getAllServices);

serviceRouter.get(
  "/admin",
  authenticateJwt,
  authorizeRequest(["admin", "superAdmin"]),
  serviceController.getAllServicesAdmin
);

serviceRouter.get(
  "/business/:id",
  authenticateJwt,
  authorizeRequest(["rep", "root"]),
  serviceController.getServicesByBusinessId
);

serviceRouter.get("/:id", serviceController.getServiceById);

serviceRouter.delete(
  "/",
  authenticateJwt,
  authorizeRequest(
    ["superAdmin", "root"],
    true,
    "service",
    "delete",
    true,
    "business",
    "Service"
  ),
  serviceController.deleteService
);
serviceRouter.post(
  "/restore",
  authenticateJwt,
  authorizeRequest(["superAdmin", "admin"], true, "service", "restore"),
  serviceController.restoreService
);

serviceRouter.put(
  "/update",
  authenticateJwt,
  authorizeRequest(
    ["root", "rep"],
    true,
    "service",
    "update",
    true,
    "business",
    "Service"
  ),
  serviceController.updateService
);

serviceRouter.get("/type/:type", serviceController.getServicesByType);

serviceRouter.put(
  "/:id/increment-views",
  serviceController.incrementServiceViews
);

export default serviceRouter;
