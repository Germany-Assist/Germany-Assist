import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../configs/database.js";
export default class Order extends Model {}

Order.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    amount: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("refunded", "paid", "fulfilled", "completed"),
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    timelineId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    serviceId: { type: DataTypes.INTEGER, allowNull: false },
    stripePaymentIntentId: { type: DataTypes.STRING, unique: true },
    currency: { type: DataTypes.STRING, defaultValue: "usd" },
    amount: { type: DataTypes.FLOAT, allowNull: false },
  },
  { sequelize, paranoid: true }
);
