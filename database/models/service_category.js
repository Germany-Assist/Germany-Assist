import { Model, DataTypes } from "sequelize";
import { sequelize } from "../connection.js";

class ServiceCategory extends Model {}
ServiceCategory.init(
  {
    service_id: { type: DataTypes.INTEGER, allowNull: false },
    category_id: { type: DataTypes.STRING, allowNull: false },
  },
  {
    sequelize,
    paranoid: true,
  }
);
export default ServiceCategory;
