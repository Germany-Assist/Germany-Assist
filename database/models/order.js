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
      type: DataTypes.ENUM(
        "pending client approval",
        "paid",
        "cancelled",
        "completed"
      ),
      defaultValue: "pending",
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    service_provider_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    inquiry_id: { type: DataTypes.INTEGER, allowNull: false },
    contract: { type: DataTypes.TEXT, allowNull: false },
    variables: { type: DataTypes.JSONB, allowNull: false },
  },
  { sequelize, paranoid: true }
);
