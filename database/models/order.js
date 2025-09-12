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
      type: DataTypes.ENUM("pending", "paid", "cancelled", "completed"),
      defaultValue: "pending",
    },
    user_id: {
      type: DataTypes.INTEGER,
    },
  },
  { sequelize, paranoid: true }
);
