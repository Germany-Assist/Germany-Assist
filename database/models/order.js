import { DataTypes, Model } from "sequelize";
import { sequelize } from "../connection.js";
export default class Order extends Model {}

Order.init(
  {
    quantity: { type: DataTypes.INTEGER, defaultValue: 1 },
    status: {
      type: DataTypes.ENUM("pending", "paid", "cancelled", "completed"),
      defaultValue: "pending",
    },
    user_id: {
      type: DataTypes.INTEGER,
    },
    service_provider_id: {
      type: DataTypes.UUID,
    },
    service_id: {
      type: DataTypes.INTEGER,
    },
    payment_id: {
      type: DataTypes.INTEGER,
    },
  },
  { sequelize, paranoid: true }
);
