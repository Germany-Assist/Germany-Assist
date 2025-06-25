import Coupon from "../models/coupon.js";
const data = [
  {
    coupon_code: "550e8400-e29b-41d4-a716-446655440000",
    discount_rate: 0.15,
    expDate: "2023-12-31",
    providersProfileId: 1,
  },
  {
    coupon_code: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
    discount_rate: 0.2,
    expDate: "2023-11-30",
    providersProfileId: 2,
  },
  {
    coupon_code: "7c6b4d10-9e3b-43a8-b8c7-9a2b5f3d0c8a",
    discount_rate: 0.1,
    expDate: "2024-01-15",
    providersProfileId: 2,
  },
  {
    coupon_code: "9a8b7c6d-5e43-4f2a-b1c0-d3e4f5a6b7c8",
    discount_rate: 0.25,
    expDate: "2023-10-31",
    providersProfileId: 2,
  },
  {
    coupon_code: "b2c3a4d5-e6f7-48c9-b1a2-3d4e5f6a7b8c",
    discount_rate: 0.3,
    expDate: "2024-02-28",
    providersProfileId: 3,
  },
  {
    coupon_code: "d4e5f6a7-b8c9-4d1e-a2f3-4b5c6d7e8f9a",
    discount_rate: 0.05,
    expDate: "2023-09-30",
    providersProfileId: 3,
  },
  {
    coupon_code: "f1e2d3c4-b5a6-47f8-9e0d-1c2b3a4f5e6d",
    discount_rate: 0.18,
    expDate: "2024-03-15",
    providersProfileId: 4,
  },
  {
    coupon_code: "1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d",
    discount_rate: 0.22,
    expDate: "2023-12-15",
    providersProfileId: 4,
  },
  {
    coupon_code: "3b4c5d6e-7f8a-49b0-c1d2-e3f4a5b6c7d8",
    discount_rate: 0.12,
    expDate: "2024-04-30",
    providersProfileId: 5,
  },
  {
    coupon_code: "5c6d7e8f-9a0b-4c1d-a2e3-4f5a6b7c8d9e",
    discount_rate: 0.08,
    expDate: "2023-11-15",
    providersProfileId: 5,
  },
];
export default async function couponSeed() {
  await Coupon.bulkCreate(data);
}
