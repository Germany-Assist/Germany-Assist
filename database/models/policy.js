import { sequelize } from "../connection.js";
import { DataTypes, Model } from "sequelize";
export default class Policy extends Model {}

Policy.init(
  {
    userId: { type: DataTypes.INTEGER() },
    providersProfileId: { type: DataTypes.INTEGER() },
    businessProfileId: { type: DataTypes.INTEGER() },
    policy: { type: DataTypes.JSON() },
  },
  {
    sequelize,
    paranoid: true,
  }
);
