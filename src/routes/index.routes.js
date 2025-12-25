import assetRouter from "../modules/assets/assets.routes.js";
import serviceProviderRouter from "../modules/serviceProvider/serviceProvider.routes.js";
import categoryRouter from "../modules/category/category.routes.js";
import reviewRouter from "../modules/review/review.routes.js";
import serviceRouter from "../modules/service/service.routes.js";
import userRouter from "../modules/user/user.routes.js";
import permissionRouter from "../modules/permission/permissions.routes.js";
import ordersRouter from "../modules/order/orders.routes.js";
import postRouter from "../modules/post/post.routes.js";
import authRouter from "../modules/auth/auth.routes.js";
import dashboardRouter from "../modules/admin/dashboard.routes.js";
import { Router } from "express";

const apiRouter = Router();

apiRouter
  .use("/user", userRouter)
  .use("/asset", assetRouter)
  .use("/category", categoryRouter)
  .use("/serviceProvider", serviceProviderRouter)
  .use("/review", reviewRouter)
  .use("/service", serviceRouter)
  .use("/permission", permissionRouter)
  .use("/order", ordersRouter)
  .use("/post", postRouter)
  .use("/auth", authRouter)
  .use("/admin/dashboard", dashboardRouter);

export default apiRouter;
