import { Router } from "express";
import * as couponController from "../controllers/coupon.controller.js";

const couponRouter = Router();

couponRouter.post("/", couponController.createCoupon);
couponRouter.get("/", couponController.getAllCoupons);
couponRouter.get("/:id", couponController.getCouponById);
couponRouter.get("/code/:code", couponController.getCouponByCode);
couponRouter.put("/:id", couponController.updateCoupon);
couponRouter.delete("/:id", couponController.deleteCoupon);
couponRouter.post("/:id/restore", couponController.restoreCoupon);
couponRouter.get("/validate/:code", couponController.validateCoupon);

export default couponRouter;
