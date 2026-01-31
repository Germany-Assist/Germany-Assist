import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../configs/database.js";

class VerificationRequest extends Model {}

VerificationRequest.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    serviceProviderId: {
      type: DataTypes.UUID,
      allowNull: false,
      validate: {
        isUUID: { args: 4, msg: "Service Provider must be a valid UUIDv4" },
      },
    },
    type: {
      type: DataTypes.ENUM("identity", "category", "badge"),
      allowNull: false,
      validate: {
        isIn: {
          args: [["identity", "category", "skill"]],
          msg: "Type must be one of 'identity', 'category', 'skill'",
        },
      },
    },
    status: {
      type: DataTypes.ENUM("pending", "approved", "rejected", "adminRequest"),
      allowNull: false,
      defaultValue: "pending",
      validate: {
        isIn: {
          args: [["pending", "approved", "rejected", "adminRequest"]],
          msg: "Status must be 'adminRequest', 'pending', 'approved', or 'rejected'",
        },
      },
    },
    adminNote: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: "verification_requests",
    paranoid: true,
  },
);

export default VerificationRequest;
