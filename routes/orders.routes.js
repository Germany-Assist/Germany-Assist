import { Router } from "express";
import jwtMiddleware from "../middlewares/jwt.middleware.js";
import orderController from "../controllers/order.controller.js";
import { validateExpress } from "../middlewares/expressValidator.js";
import { idHashedParamValidator } from "../validators/general.validators.js";

const ordersRouter = Router();

ordersRouter.get(
  "/checkout/:id",
  jwtMiddleware.authenticateJwt,
  idHashedParamValidator,
  validateExpress,
  orderController.checkoutController
);
ordersRouter.get(
  "/pay/:id",
  jwtMiddleware.authenticateJwt,
  idHashedParamValidator,
  validateExpress,
  orderController.payOrder
);
//---------get order by id-----------//
ordersRouter.get(
  "/admin/:id",
  jwtMiddleware.authenticateJwt,
  idHashedParamValidator,
  validateExpress,
  orderController.getOrderAdmin
);
ordersRouter.get(
  "/serviceProvider/:id",
  jwtMiddleware.authenticateJwt,
  idHashedParamValidator,
  validateExpress,
  orderController.getOrderSP
);
ordersRouter.get(
  "/client/:id",
  jwtMiddleware.authenticateJwt,
  idHashedParamValidator,
  validateExpress,
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

export default ordersRouter;
