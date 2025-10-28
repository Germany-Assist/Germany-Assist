import { DataTypes, Model } from "sequelize";
import { sequelize } from "../connection.js";
export default class Order extends Model {}

Order.init(
  {
    amount: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("refunded", "paid", "fulfilled", "completed"),
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    timeline_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    service_id: { type: DataTypes.INTEGER, allowNull: false },
    stripe_payment_intent_id: { type: DataTypes.STRING, unique: true },
    currency: { type: DataTypes.STRING, defaultValue: "usd" },
    amount: { type: DataTypes.FLOAT, allowNull: false },
  },
  { sequelize, paranoid: true }
);
