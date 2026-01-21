import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../configs/database.js";

class Variant extends Model {}

Variant.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    serviceId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: { msg: "Service ID is required" },
        isInt: { msg: "Service ID must be an integer" },
        min: {
          args: [1],
          msg: "Service ID must be a positive integer",
        },
      },
    },
    isArchived: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      validate: {
        isIn: {
          args: [[true, false]],
          msg: "isArchived must be either true or false",
        },
      },
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        isNumeric: { msg: "Price must be a valid number" },
        min: { args: [0], msg: "Price cannot be negative" },
      },
    },
    limit: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: { msg: "Limit is required" },
        isInt: { msg: "Limit must be an integer" },
        min: {
          args: [1],
          msg: "Limit must be a positive integer",
        },
      },
    },
    label: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        len: {
          args: [0, 100],
          msg: "Label cannot exceed 100 characters",
        },
        is: {
          args: /^[\w\s-]*$/i, // letters, numbers, spaces, underscores, hyphens
          msg: "Label can only contain letters, numbers, spaces, underscores, and hyphens",
        },
      },
    },
  },
  { sequelize, paranoid: true },
);
export default Variant;
