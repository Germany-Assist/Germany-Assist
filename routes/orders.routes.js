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
//---------get order by id-----------//
ordersRouter.get(
  "/admin/:id",
  jwtMiddleware.authenticateJwt,
  orderController.getOrderAdmin
);
ordersRouter.get(
  "/serviceProvider/:id",
  jwtMiddleware.authenticateJwt,
  orderController.getOrderSP
);
ordersRouter.get(
  "/client/:id",
  jwtMiddleware.authenticateJwt,
  orderController.getOrderCL
);
//---------get order-----------//
ordersRouter.get(
  "/admin",
  jwtMiddleware.authenticateJwt,
  orderController.getOrdersAdmin
);
ordersRouter.get(
  "/serviceProvider",
  jwtMiddleware.authenticateJwt,
  orderController.getOrdersSP
);
ordersRouter.get(
  "/client",
  jwtMiddleware.authenticateJwt,
  orderController.getOrdersCL
);
//--------cancel Order------//
ordersRouter.put(
  "/serviceProvider/:id",
  jwtMiddleware.authenticateJwt,
  orderController.cancelOrderSP
);
ordersRouter.put(
  "/client/:id",
  jwtMiddleware.authenticateJwt,
  orderController.cancelOrderCL
);
export default ordersRouter;
