import { Model, DataTypes } from "sequelize";
import { sequelize } from "../connection.js";

export default class UserRole extends Model {}

UserRole.init(
  {
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    related_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    related_type: {
      type: DataTypes.ENUM("Employer", "ServiceProvider", "client", "admin"),
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
