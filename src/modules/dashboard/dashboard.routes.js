import { Router } from "express";
import dashboardController from "./dashboard.controllers.js";
import jwtUtils from "../../middlewares/jwt.middleware.js";

const dashboardRouter = Router();

dashboardRouter.get(
  "/provider/finance",
  jwtUtils.authenticateJwt,
  dashboardController.SPFinancialConsole
);

export default dashboardRouter;
