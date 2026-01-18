import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../configs/database.js";

class Payout extends Model {}

Payout.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },

    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    amountToPay: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: "USD",
    },
    status: {
      type: DataTypes.ENUM("pending", "processing", "paid", "failed"),
      allowNull: false,
      defaultValue: "pending",
    },

    attempts: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    lastError: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "last_error",
    },
  },
  {
    sequelize,
    paranoid: true,
  },
);

export default Payout;
