import { Model, DataTypes } from "sequelize";
import { sequelize } from "../connection.js";
export default class Notification extends Model {}

Notification.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        isInt: true,
        min: 1,
      },
    },
    service_provider_id: {
      type: DataTypes.UUID,
      allowNull: true,
      validate: {
        isUUID: 4,
      },
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    type: {
      type: DataTypes.ENUM("info", "warning", "alert", "system"),
      defaultValue: "info",
      allowNull: false,
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },

  {
    sequelize,
    tableName: "notifications",
    indexes: [
      {
        name: "user_unread_index",
        fields: ["user_id", "is_read"],
      },
    ],
  }
);
