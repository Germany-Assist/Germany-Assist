import { Router } from "express";
import jwtMiddleware from "../../middlewares/jwt.middleware.js";
import orderController from "./order.controller.js";
import { validateExpress } from "../../middlewares/expressValidator.js";
import { idHashedParamValidator } from "../../validators/general.validators.js";

const ordersRouter = Router();

ordersRouter.get(
  "/pay",
  jwtMiddleware.authenticateJwt,
  orderController.payOrder,
);

//---------get order-----------//
ordersRouter.get(
  "/client/checkIfBought/:serviceId",
  jwtMiddleware.authenticateJwt,
  orderController.checkIfUserBoughtService,
);
ordersRouter.get(
  "/serviceProvider/getAll",
  jwtMiddleware.authenticateJwt,
  orderController.getOrdersSP,
);
ordersRouter.get(
  "/client/getAll",
  jwtMiddleware.authenticateJwt,
  orderController.getOrdersClient,
);
ordersRouter.get(
  "/serviceProvider/close/:orderId",
  jwtMiddleware.authenticateJwt,
  orderController.serviceProviderCloseOrder,
);
export default ordersRouter;
