import { DataTypes, Model } from "sequelize";
import { sequelize } from "../connection.js";

class Timeline extends Model {}

Timeline.init(
  {
    service_id: { type: DataTypes.INTEGER, allowNull: false },
    is_archived: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  { sequelize, paranoid: true }
);
export default Timeline;
