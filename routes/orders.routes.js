import { Router } from "express";
import jwtMiddleware from "../middlewares/jwt.middleware.js";
import orderController from "../controllers/order.controller.js";
const ordersRouter = Router();

ordersRouter.get(
  "/checkout/:id",
  jwtMiddleware.authenticateJwt,
  orderController.checkoutController
);
ordersRouter.get(
  "/generate/:id",
  jwtMiddleware.authenticateJwt,
  orderController.generateOffer
);
ordersRouter.post(
  "/",
  jwtMiddleware.authenticateJwt,
  orderController.createOrder
);
export default ordersRouter;
