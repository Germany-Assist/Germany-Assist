import { Model, DataTypes } from "sequelize";
import { sequelize } from "../connection.js";
export default class Permission extends Model {}
Permission.init(
  {
    action: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    resource: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
  },
  { sequelize, paranoid: true }
);
