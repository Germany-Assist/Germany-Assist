import { sequelize } from "../connection.js";
import { DataTypes, Model } from "sequelize";
// please note that this model was only created to be used in seeds,
// this model will be created automatically by the constrains
export default class UsersServices extends Model {}

UsersServices.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    serviceId: {
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
    modelName: "users_services",
    tableName: "users_services",
  }
);
