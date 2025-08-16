import { Model, DataTypes } from "sequelize";
import { sequelize } from "../connection.js";

export default class UserPermission extends Model {}

UserPermission.init(
  {
    UserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: { msg: "UserId must be an integer" },
        min: { args: [1], msg: "UserId must be greater than 0" },
      },
    },
    PermissionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: { msg: "PermissionId must be an integer" },
        min: { args: [1], msg: "PermissionId must be greater than 0" },
      },
    },
  },
  {
    sequelize,
    modelName: "user_permission",
    tableName: "user_permission",
    indexes: [
      {
        unique: true,
        fields: ["UserId", "PermissionId"],
      },
    ],
  }
);
