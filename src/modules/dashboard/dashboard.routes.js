import { Router } from "express";
import dashboardController from "./dashboard.controllers.js";
import jwtUtils from "../../middlewares/jwt.middleware.js";

const dashboardRouter = Router();

dashboardRouter.get(
  "/provider/finance",
  jwtUtils.authenticateJwt,
  dashboardController.SPFinancialConsole,
);
dashboardRouter.get(
  "/admin/services",
  jwtUtils.authenticateJwt,
  dashboardController.adminStatisticalServices,
);

dashboardRouter.get(
  "/admin/finance",
  jwtUtils.authenticateJwt,
  dashboardController.adminStatisticalFinance,
);
export default dashboardRouter;
