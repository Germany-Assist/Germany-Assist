import { Router } from "express";
import jwtMiddleware from "../../middlewares/jwt.middleware.js";
import orderController from "./order.controller.js";
import { validateExpress } from "../../middlewares/expressValidator.js";
import { idHashedParamValidator } from "../../validators/general.validators.js";

const ordersRouter = Router();

ordersRouter.get(
  "/checkout/:id",
  jwtMiddleware.authenticateJwt,
  idHashedParamValidator,
  validateExpress,
  orderController.checkoutController
);
ordersRouter.get(
  "/pay",
  jwtMiddleware.authenticateJwt,
  orderController.payOrder
);
//---------get order by id-----------//
ordersRouter.get(
  "/admin/getById/:id",
  jwtMiddleware.authenticateJwt,
  idHashedParamValidator,
  validateExpress,
  orderController.getOrderAdmin
);
ordersRouter.get(
  "/serviceProvider/getById/:id",
  jwtMiddleware.authenticateJwt,
  idHashedParamValidator,
  validateExpress,
  orderController.getOrderSP
);
ordersRouter.get(
  "/client/getById/:id",
  jwtMiddleware.authenticateJwt,
  idHashedParamValidator,
  validateExpress,
  orderController.getOrderCL
);
//---------get order-----------//
ordersRouter.get(
  "/admin/getAll",
  jwtMiddleware.authenticateJwt,
  orderController.getOrdersAdmin
);
ordersRouter.get(
  "/serviceProvider/getAll",
  jwtMiddleware.authenticateJwt,
  orderController.getOrdersSP
);
ordersRouter.get(
  "/client/getAll",
  jwtMiddleware.authenticateJwt,
  orderController.getOrdersCL
);
// ordersRouter.get(
//   "/serviceProvider/checkout/:orderId",
//   jwtMiddleware.authenticateJwt,
//   orderController.serviceProviderCheckout
// );
ordersRouter.get(
  "/serviceProvider/close/:orderId",
  jwtMiddleware.authenticateJwt,
  orderController.serviceProviderCloseOrder
);
export default ordersRouter;
