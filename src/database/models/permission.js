import { Model, DataTypes } from "sequelize";
import { sequelize } from "../../configs/database.js";

export default class Permission extends Model {}

Permission.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    action: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: { msg: "Action cannot be empty" },
        len: {
          args: [2, 50],
          msg: "Action must be between 2 and 50 characters",
        },
        is: {
          args: /^[a-z_]+$/i,
          msg: "Action can only contain letters and underscores",
        },
      },
    },
    resource: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: { msg: "Resource cannot be empty" },
        len: {
          args: [2, 50],
          msg: "Resource must be between 2 and 50 characters",
        },
        is: {
          args: /^[a-z_]+$/i,
          msg: "Resource can only contain letters and underscores",
        },
      },
    },
    description: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: { msg: "Description cannot be empty" },
        len: {
          args: [5, 50],
          msg: "Description must be between 5 and 50 characters",
        },
      },
    },
  },
  {
    sequelize,
    paranoid: true,
    indexes: [
      {
        unique: true,
        fields: ["action", "resource"],
      },
    ],
  }
);
