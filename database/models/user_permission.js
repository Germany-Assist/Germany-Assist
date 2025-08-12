import { Model, DataTypes } from "sequelize";
import { sequelize } from "../connection.js";
export default class UserPermission extends Model {}
UserPermission.init(
  {
    UserId: {
      type: DataTypes.INTEGER(),
      allowNull: false,
    },
    PermissionId: {
      type: DataTypes.INTEGER(),
      allowNull: false,
    },
  },
  {
    sequelize,
    // paranoid: true,
    modelName: "user_permission",
    tableName: "user_permission",
  }
);
