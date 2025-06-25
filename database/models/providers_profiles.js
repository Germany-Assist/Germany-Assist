import { DataTypes, Model } from "sequelize";
import { sequelize } from "../connection.js";
class ProvidersProfile extends Model {}

ProvidersProfile.init(
  {
    // business that teaches courses
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
      unique: true,
    },
    phone_number: {
      type: DataTypes.STRING(20),
    },
    rating: {
      type: DataTypes.FLOAT(),
    },
    total_reviews: {
      type: DataTypes.INTEGER(),
    },
    image: {
      type: DataTypes.TEXT(),
    },
  },

  {
    sequelize,
    paranoid: true,
    modelName: "providers_profiles",
  }
);
export default ProvidersProfile;
