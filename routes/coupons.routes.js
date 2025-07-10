import { Router } from "express";
import {
  createCoupon,
  getAllCoupons,
  getCouponById,
  getCouponByCode,
  updateCoupon,
  deleteCoupon,
  restoreCoupon,
  validateCoupon,
} from "../controllers/coupon.controller.js";

const couponRouter = Router();

couponRouter.post("/", async (req, res, next) => {
  try {
    const coupon = await createCoupon(req.body);
    res.sendStatus(201);
  } catch (error) {
    next(error);
  }
});

couponRouter.get("/", async (req, res, next) => {
  try {
    const coupons = await getAllCoupons(req.query);
    res.send(coupons);
  } catch (error) {
    next(error);
  }
});

couponRouter.get("/:id", async (req, res, next) => {
  try {
    const coupon = await getCouponById(req.params.id);
    res.send(coupon);
  } catch (error) {
    next(error);
  }
});

couponRouter.get("/code/:code", async (req, res, next) => {
  try {
    const coupon = await getCouponByCode(req.params.code);
    res.send(coupon);
  } catch (error) {
    next(error);
  }
});

couponRouter.put("/:id", async (req, res, next) => {
  try {
    const coupon = await updateCoupon(req.params.id, req.body);
    res.send(coupon);
  } catch (error) {
    next(error);
  }
});

couponRouter.delete("/:id", async (req, res, next) => {
  try {
    const result = await deleteCoupon(req.params.id);
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
});

couponRouter.post("/:id/restore", async (req, res, next) => {
  try {
    const coupon = await restoreCoupon(req.params.id);
    res.send(coupon);
  } catch (error) {
    next(error);
  }
});

couponRouter.get("/validate/:code", async (req, res, next) => {
  try {
    const validation = await validateCoupon(req.params.code);
    res.status(200).json(validation);
  } catch (error) {
    next(error);
  }
});

export default couponRouter;
