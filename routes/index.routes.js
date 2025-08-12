import assteRouter from "./assets.routes.js";
import businessRouter from "./busniess.routes.js";
import contractRouter from "./contract.routes.js";
import couponRouter from "./coupons.routes.js";
import reviewRouter from "./review.routes.js";
import serviceRouter from "./service.routes.js";
import userRouter from "./user.routes.js";
import { Router } from "express";
import { NODE_ENV } from "../configs/serverConfig.js";

const apiRouter = Router();

///// WARNING THESE END POINT NEEDS 1.Validation 2.Authorization 3.Authentication

apiRouter
  .use("/user", userRouter) // ✅
  .use("/asset", assteRouter) //
  .use("/coupon", couponRouter) //
  .use("/contract", contractRouter) //
  .use("/business", businessRouter) // ✅
  .use("/review", reviewRouter) //
  .use("/service", serviceRouter); //

// Transactions;
// Posts;
// Comments;
// Categories;
// Badges;
// Events;
// Locations;
// Policies;
export default apiRouter;
