import { Model, DataTypes } from "sequelize";
import { sequelize } from "../../configs/database.js";

export default class UserRole extends Model {}

UserRole.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    related_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    relatedType: {
      type: DataTypes.ENUM(
        "Employer",
        "ServiceProvider",
        "client",
        "admin",
        "super_admin"
      ),
      allowNull: true,
    },
    role: {
      type: DataTypes.ENUM(
        "service_provider_root",
        "service_provider_rep",
        "employer_root",
        "employer_rep",
        "client",
        "admin",
        "super_admin"
      ),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "UserRole",
  }
);
