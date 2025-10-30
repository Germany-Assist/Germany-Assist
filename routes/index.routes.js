import assetRouter from "./assets.routes.js";
import serviceProviderRouter from "./serviceProvider.routes.js";
import categoryRouter from "./category.routes.js";
import couponRouter from "./coupons.routes.js";
import reviewRouter from "./review.routes.js";
import serviceRouter from "./service.routes.js";
import userRouter from "./user.routes.js";
import permissionRouter from "./permissions.routes.js";
import { Router } from "express";
import ordersRouter from "./orders.routes.js";
import postRouter from "../routes/post.routes.js";

const apiRouter = Router();

apiRouter
  .use("/user", userRouter) //
  .use("/asset", assetRouter) //
  .use("/coupon", couponRouter) //
  .use("/category", categoryRouter) //
  .use("/serviceProvider", serviceProviderRouter) //
  .use("/review", reviewRouter) //
  .use("/service", serviceRouter) //
  .use("/permission", permissionRouter)
  .use("/order", ordersRouter)
  .use("/post", postRouter);

// Comments;
// Badges;
// Events;

export default apiRouter;
