import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../database/connection.js";
class BusinessProfiles extends Model {}

BusinessProfiles.init(
  {
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    about: {
      type: DataTypes.TEXT(),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT(),
      allowNull: false,
    },
    views: {
      type: DataTypes.INTEGER(),
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    phone_number: {
      type: DataTypes.STRING(20),
    },
    image: {
      type: DataTypes.TEXT(),
    },
  },
  {
    sequelize,
    paranoid: true,
    modelName: "business_profiles",
  }
);
export default BusinessProfiles;
