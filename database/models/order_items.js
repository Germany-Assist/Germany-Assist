import { DataTypes, Model } from "sequelize";
import { sequelize } from "../connection.js";
export default class OrderItems extends Model {}

OrderItems.init(
  {
    order_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    service_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    paid_price: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
  },
  { sequelize, paranoid: true }
);
