import { Model, DataTypes } from "sequelize";
import { sequelize } from "../connection.js";

export default class UserRole extends Model {}

UserRole.init(
  {
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    related_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    relatedType: {
      type: DataTypes.ENUM("Employer", "ServiceProvider"),
    },
    role: {
      type: DataTypes.ENUM(
        "service_provider_root",
        "service_provider_rep",
        "employer_root",
        "employer_rep"
      ),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "UserRole",
  }
);
