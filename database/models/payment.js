import { Model, DataTypes } from "sequelize";
import { sequelize } from "../connection.js";

export default class Payment extends Model {}

Payment.init(
  {
    stripe_payment_intent_id: { type: DataTypes.STRING, unique: true },
    currency: { type: DataTypes.STRING, defaultValue: "usd" },
    amount: { type: DataTypes.FLOAT, allowNull: false },
    status: {
      type: DataTypes.ENUM(
        "requires_payment",
        "succeeded",
        "failed",
        "refunded"
      ),
      allowNull: false,
    },
    related_type: {
      type: DataTypes.ENUM("order", "subscription"),
      allowNull: false,
    },
    related_id: { type: DataTypes.INTEGER, allowNull: false },
  },
  { sequelize, paranoid: true }
);
