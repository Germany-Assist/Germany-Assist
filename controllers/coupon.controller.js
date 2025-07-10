import db from "../database/dbIndex.js";
import { v4 as uuidv4 } from "uuid";

// Create a new coupon
export const createCoupon = async (data) => {
  const { discount_rate, expDate, providersProfileId } = data;
  return await db.Coupon.create({
    coupon_code: uuidv4(),
    discount_rate,
    expDate,
    providersProfileId,
  });
};

// Get all coupons
export const getAllCoupons = async (filters = {}) => {
  return await db.Coupon.findAll({
    where: filters,
  });
};

// Get coupon by ID
export const getCouponById = async (id) => {
  const coupon = await db.Coupon.findByPk(id);
  if (!coupon) throw new Error("Coupon not found");
  return coupon;
};

// Get coupon by code
export const getCouponByCode = async (code) => {
  const coupon = await db.Coupon.findOne({ where: { coupon_code: code } });
  if (!coupon) throw new Error("Coupon not found");
  return coupon;
};

// Update coupon
export const updateCoupon = async (id, updateData) => {
  const coupon = await db.Coupon.findByPk(id);
  if (!coupon) throw new Error("Coupon not found");
  if (updateData.coupon_code) {
    delete updateData.coupon_code;
  }
  await coupon.update(updateData);
  return coupon;
};

// Delete coupon (soft delete)
export const deleteCoupon = async (id) => {
  const coupon = await db.Coupon.findByPk(id);
  if (!coupon) throw new Error("Coupon not found");
  await coupon.destroy();
  return { id, message: "Coupon deleted" };
};

// Restore soft-deleted coupon
export const restoreCoupon = async (id) => {
  const coupon = await db.Coupon.findOne({
    where: { id },
    paranoid: false,
  });

  if (!coupon) throw new Error("Coupon not found");
  if (!coupon.deletedAt) throw new Error("Coupon is not deleted");

  await coupon.restore();
  return coupon;
};

// Validate coupon (check expiration and existence)
export const validateCoupon = async (code) => {
  const coupon = await db.Coupon.findOne({
    where: { coupon_code: code },
  });
  if (!coupon) throw new Error("Invalid coupon code");
  if (new Date(coupon.expDate) < new Date()) {
    throw new Error("Coupon has expired");
  }
  return {
    valid: true,
    discount_rate: coupon.discount_rate,
    coupon_id: coupon.id,
  };
};
