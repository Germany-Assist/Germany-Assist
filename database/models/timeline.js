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
    service_id: { type: DataTypes.INTEGER, allowNull: false },
    is_archived: { type: DataTypes.BOOLEAN, defaultValue: false },
    label: { type: DataTypes.STRING },
  },
  { sequelize, paranoid: true }
);
export default Timeline;
