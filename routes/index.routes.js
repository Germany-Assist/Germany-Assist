import assetRouter from "./assets.routes.js";
import serviceProviderRouter from "./serviceProvider.routes.js";
import contractRouter from "./contract.routes.js";
import couponRouter from "./coupons.routes.js";
import reviewRouter from "./review.routes.js";
import serviceRouter from "./service.routes.js";
import userRouter from "./user.routes.js";
import permissionRouter from "./permissions.routes.js";

import { Router } from "express";
import { NODE_ENV } from "../configs/serverConfig.js";
import paymentsRouter from "./payments.routes.js";
import ordersRouter from "./orders.routes.js";

const apiRouter = Router();

apiRouter
  .use("/user", userRouter) //
  .use("/asset", assetRouter) //
  .use("/coupon", couponRouter) //
  .use("/contract", contractRouter) //
  .use("/serviceProvider", serviceProviderRouter) //
  .use("/review", reviewRouter) //
  .use("/service", serviceRouter) //
  .use("/permission", permissionRouter)
  .use("/order", ordersRouter);

// Categories; to be discussed
// Transactions  to be discussed
// Posts;
// Comments;
// Badges;
// Events;

export default apiRouter;
