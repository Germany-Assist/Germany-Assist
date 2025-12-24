// models/Event.js
import { Model, DataTypes } from "sequelize";
import { sequelize } from "../../configs/database.js";

/**
 * Event model: stores actions happening in the system
 * Actor can be admin, service_provider, or employer (polymorphic)
 */
export default class Event extends Model {}

Event.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    eventType: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "event_type",
    },

    userActorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "actor_id",
    },
    providerActorId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: "actor_id",
    },
    actorType: {
      type: DataTypes.ENUM("admin", "service_provider", "employer"),
      allowNull: false,
      field: "actor_type",
    },

    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "events",
  }
);
