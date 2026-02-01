import { Model, DataTypes } from "sequelize";
import { sequelize } from "../../configs/database.js";

export default class ServiceProviderCategory extends Model {}

ServiceProviderCategory.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: { msg: "category must be an integer" },
      },
    },
    serviceProviderId: {
      type: DataTypes.UUID,
      allowNull: false,
      validate: {
        isUUID: { args: 4, msg: "ID must be a valid UUIDv4" },
      },
    },
  },
  {
    sequelize,
    modelName: "ServiceProviderCategory",
    indexes: [
      {
        unique: true,
        fields: ["category_id", "service_provider_id"],
      },
    ],
  },
);
