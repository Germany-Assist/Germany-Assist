import { sequelize } from "../connection.js";
import { DataTypes, Model } from "sequelize";
// please note that this model was only created to be used in seeds,
// this model will be created automatically by the constrains
export default class UserBusinessProfiles extends Model {}
UserBusinessProfiles.init(
  {
    userId: { type: DataTypes.INTEGER() },
    businessProfileId: { type: DataTypes.INTEGER() },
  },
  { sequelize, modelName: "users_business_profiles" }
);
