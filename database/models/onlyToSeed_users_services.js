import { sequelize } from "../connection.js";
import { DataTypes, Model } from "sequelize";
// please note that this model was only created to be used in seeds,
// this model will be created automatically by the constrains
export default class UserServices extends Model {}
UserServices.init(
  {
    userId: { type: DataTypes.INTEGER() },
    serviceId: { type: DataTypes.INTEGER() },
  },
  { sequelize, modelName: "users_services" }
);
