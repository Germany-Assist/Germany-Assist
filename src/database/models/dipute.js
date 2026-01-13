import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../configs/database.js";

class Dispute extends Model {}

Dispute.init(
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

    openedBy: {
      type: DataTypes.ENUM("buyer", "system"),
      allowNull: false,
    },

    reason: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    status: {
      type: DataTypes.ENUM("open", "in_review", "resolved"),
      allowNull: false,
      defaultValue: "open",
    },

    resolution: {
      type: DataTypes.ENUM("buyer_won", "provider_won", "partial", "cancelled"),
      allowNull: true,
    },

    resolvedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "disputes",
    paranoid: true,
    timestamps: true,
    indexes: [{ fields: ["order_id"] }, { fields: ["status"] }],
    sequelize,
  }
);

export default Dispute;
