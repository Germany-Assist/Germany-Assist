import serviceProviderRouter from "../modules/serviceProvider/serviceProvider.routes.js";
import categoryRouter from "../modules/category/category.routes.js";
import reviewRouter from "../modules/review/review.routes.js";
import serviceRouter from "../modules/service/service.routes.js";
import userRouter from "../modules/user/user.routes.js";
import permissionRouter from "../modules/permission/permissions.routes.js";
import ordersRouter from "../modules/order/orders.routes.js";
import postRouter from "../modules/post/post.routes.js";
import authRouter from "../modules/auth/auth.routes.js";
import metaRouter from "../modules/meta/meta.routes.js";
import { Router } from "express";
import dashboardRouter from "../modules/dashboard/dashboard.routes.js";
const apiRouter = Router();
apiRouter
  .use("/user", userRouter)
  .use("/category", categoryRouter)
  .use("/serviceProvider", serviceProviderRouter)
  .use("/review", reviewRouter)
  .use("/service", serviceRouter)
  .use("/permission", permissionRouter)
  .use("/order", ordersRouter)
  .use("/post", postRouter)
  .use("/auth", authRouter)
  .use("/meta", metaRouter)
  .use("/dashboard", dashboardRouter);

export default apiRouter;
