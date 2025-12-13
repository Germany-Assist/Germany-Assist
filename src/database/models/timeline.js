import { DataTypes, Model } from "sequelize";
import { sequelize } from "../connection.js";

class Timeline extends Model {}

Timeline.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    service_id: {
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
    is_archived: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      validate: {
        isIn: {
          args: [[true, false]],
          msg: "is_archived must be either true or false",
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
  { sequelize, paranoid: true }
);
export default Timeline;
