import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../configs/database.js";
export default class AuditLog extends Model {}

AuditLog.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    entityType: {
      type: DataTypes.ENUM("order", "payout"),
      allowNull: false,
    },
    entityId: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    reason: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    actorSnapshot: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    oldValue: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    newValue: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    actorType: {
      type: DataTypes.ENUM("system", "admin", "client", "provider"),
      allowNull: false,
      defaultValue: "system",
    },
    actorId: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },

    reason: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    indexes: [
      {
        fields: ["entity_type", "entity_id"],
      },
    ],
    timestamps: true,
    updatedAt: false,
    tableName: "audit_logs",
    sequelize,
  },
);
