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
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: "Type cannot be empty" },
        len: { args: [2, 50], msg: "Type must be between 2 and 50 characters" },
      },
    },
  },
  {
    sequelize,
    paranoid: true,
    modelName: "user_service",
  }
);
