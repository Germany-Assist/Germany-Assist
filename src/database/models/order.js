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
    status: {
      type: DataTypes.ENUM(
        "refunded",
        "active",
        "pending_completion",
        "completed",
        "cancelled",
      ),
      allowNull: false,
    },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    relatedId: { type: DataTypes.INTEGER, allowNull: false },
    relatedType: {
      type: DataTypes.ENUM("timeline", "oneTime"),
      allowNull: false,
    },
    serviceId: { type: DataTypes.INTEGER, allowNull: false },
    serviceProviderId: { type: DataTypes.UUID, allowNull: false },
    stripePaymentIntentId: { type: DataTypes.STRING, unique: true },
    currency: { type: DataTypes.STRING, defaultValue: "usd" },
    amount: { type: DataTypes.FLOAT, allowNull: false },
    relatedData: {
      type: DataTypes.VIRTUAL,
      get() {
        // This dynamically returns whichever association was joined
        return this.timeline || this.variant || null;
      },
    },
  },
  {
    sequelize,
    paranoid: true,
    modelName: "Order",
  },
);
