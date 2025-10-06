import { sequelize } from "../connection.js";
import { DataTypes, Model } from "sequelize";

export default class UserService extends Model {}

UserService.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: { msg: "UserId must be an integer" },
        min: { args: [1], msg: "UserId must be greater than 0" },
      },
    },
    service_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: { msg: "ServiceId must be an integer" },
        min: { args: [1], msg: "ServiceId must be greater than 0" },
      },
    },
    owner: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.user_id;
      },
    },
    type: {
      type: DataTypes.ENUM("favorite", "cart"),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "user_service",
    indexes: [
      {
        unique: true,
        fields: ["user_id", "service_id", "type"],
      },
    ],
  }
);
