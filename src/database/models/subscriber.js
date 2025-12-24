// models/Subscriber.js
import { Model, DataTypes } from "sequelize";
import { sequelize } from "../../configs/database.js";

/**
 * Subscriber model: keeps track of which users follow which entities
 * relatedType can be "service", "job", or "creator"
 */
export default class Subscriber extends Model {}

Subscriber.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "userId",
    },

    relatedType: {
      type: DataTypes.ENUM("timeline", "service_provider", "comment", "post"),
      allowNull: false,
      field: "relatedType",
    },

    relatedId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "relatedId",
    },
  },
  {
    sequelize,
    modelName: "subscribers",
  }
);
