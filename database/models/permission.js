import { Model, DataTypes } from "sequelize";
import { sequelize } from "../connection.js";

export default class Permission extends Model {}

Permission.init(
  {
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
          args: /^[a-z_]+$/i, // Only letters and underscores
          msg: "Action can only contain letters and underscores",
        },
        isIn: {
          args: [["create", "read", "update", "delete", "manage"]],
          msg: "Action must be one of: create, read, update, delete, manage",
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
