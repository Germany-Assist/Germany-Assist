import { Model, DataTypes } from "sequelize";
import { sequelize } from "../../configs/database.js";

export default class UserPermission extends Model {}

UserPermission.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: { msg: "UserId must be an integer" },
        min: { args: [1], msg: "UserId must be greater than 0" },
      },
    },
    permissionId: {
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
    indexes: [
      {
        unique: true,
        fields: ["user_id", "permission_id"],
      },
    ],
  }
);
