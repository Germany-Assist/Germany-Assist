// models/Subscriber.js
import { Model, DataTypes } from "sequelize";
import { sequelize } from "../connection.js";

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
      field: "user_id",
    },

    relatedType: {
      type: DataTypes.ENUM("timeline", "service_provider", "comment", "post"),
      allowNull: false,
      field: "related_type",
    },

    relatedId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "related_id",
    },
  },
  {
    sequelize,
    modelName: "subscribers",
  }
);
