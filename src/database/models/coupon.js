import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../configs/database.js";
import { v4 as uuidv4 } from "uuid";

class Coupon extends Model {}

Coupon.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    coupon_code: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: uuidv4,
      unique: true,
      validate: {
        isUUID: { args: 4, msg: "Coupon code must be a valid UUIDv4" },
      },
    },
    discount_rate: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        isFloat: { msg: "Discount rate must be a number" },
        min: { args: [0], msg: "Discount rate cannot be negative" },
        max: { args: [100], msg: "Discount rate cannot exceed 100%" },
      },
    },
    exp_date: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: { msg: "Expiration date must be a valid date" },
        isFuture(value) {
          if (new Date(value) <= new Date()) {
            throw new Error("Expiration date must be in the future");
          }
        },
      },
    },
  },
  {
    sequelize,
    paranoid: true,
  }
);

export default Coupon;
