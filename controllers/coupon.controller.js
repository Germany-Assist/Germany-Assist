import * as couponServices from "../services/coupons.services.js";
import { AppError } from "../utils/error.class.js";

export async function createCoupon(req, res, next) {
  try {
    const coupon = await couponServices.createCoupon(req.body);
    res.sendStatus(201);
  } catch (error) {
    if (error instanceof AppError) error.appendTrace(req.requestId);
    next(error);
  }
}
export async function getAllCoupons(req, res, next) {
  try {
    const coupons = await couponServices.getAllCoupons(req.query);
    res.send(coupons);
  } catch (error) {
    if (error instanceof AppError) error.appendTrace(req.requestId);
    next(error);
  }
}
export async function getCouponById(req, res, next) {
  try {
    const coupon = await couponServices.getCouponById(req.params.id);
    res.send(coupon);
  } catch (error) {
    if (error instanceof AppError) error.appendTrace(req.requestId);
    next(error);
  }
}

export async function getCouponByCode(req, res, next) {
  try {
    const coupon = await couponServices.getCouponByCode(req.params.code);
    res.send(coupon);
  } catch (error) {
    if (error instanceof AppError) error.appendTrace(req.requestId);
    next(error);
  }
}

export async function updateCoupon(req, res, next) {
  try {
    const coupon = await couponServices.updateCoupon(req.params.id, req.body);
    res.send(coupon);
  } catch (error) {
    if (error instanceof AppError) error.appendTrace(req.requestId);
    next(error);
  }
}

export async function deleteCoupon(req, res, next) {
  try {
    const result = await couponServices.deleteCoupon(req.params.id);
    res.sendStatus(200);
  } catch (error) {
    if (error instanceof AppError) error.appendTrace(req.requestId);
    next(error);
  }
}

export async function restoreCoupon(req, res, next) {
  try {
    const coupon = await couponServices.restoreCoupon(req.params.id);
    res.send(coupon);
  } catch (error) {
    if (error instanceof AppError) error.appendTrace(req.requestId);
    next(error);
  }
}

export async function validateCoupon(req, res, next) {
  try {
    const validation = await couponServices.validateCoupon(req.params.code);
    res.status(200).json(validation);
  } catch (error) {
    if (error instanceof AppError) error.appendTrace(req.requestId);
    next(error);
  }
}
