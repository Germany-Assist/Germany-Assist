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
    object_id: {
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
    refund_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    refund_status: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "StripeEvent",
    tableName: "stripe_events",
    timestamps: true,
  }
);

export default StripeEvent;
