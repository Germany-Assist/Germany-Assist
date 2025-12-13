import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../configs/database.js"; // adjust your path

class StripeEvent extends Model {}

StripeEvent.init(
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    objectId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: "pending",
    },
    payload: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    refundId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    refundStatus: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "StripeEvent",
    timestamps: true,
  }
);

export default StripeEvent;
