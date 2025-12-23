import { Model, DataTypes } from "sequelize";
import { sequelize } from "../../configs/database.js";

export default class Token extends Model {}

Token.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    token: {
      type: DataTypes.CHAR(255),
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      onDelete: "CASCADE",
    },
    oneTime: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    isValid: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    type: {
      type: DataTypes.ENUM("emailVerification", "passwordReset"),
      allowNull: false,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    timestamps: true,
    indexes: [
      { unique: true, fields: ["token"] },
      { fields: ["user_id"] },
      { fields: ["type"] },
    ],
  }
);
