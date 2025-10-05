import { Router } from "express";
import jwtMiddleware from "../middlewares/jwt.middleware.js";
import orderController from "../controllers/order.controller.js";
const ordersRouter = Router();

ordersRouter.post(
  "/checkout",
  jwtMiddleware.authenticateJwt,
  orderController.checkoutController
);
ordersRouter.post(
  "/pay",
  jwtMiddleware.authenticateJwt,
  orderController.payController
);
export default ordersRouter;
