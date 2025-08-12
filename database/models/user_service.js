import { sequelize } from "../connection.js";
import { DataTypes, Model } from "sequelize";
// please note that this model was only created to be used in seeds,
// this model will be created automatically by the constrains
export default class UserService extends Model {}

UserService.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    UserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    ServiceId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    paranoid: true,
    modelName: "user_service",
    tableName: "user_service",
  }
);
