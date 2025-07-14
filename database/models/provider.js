import { DataTypes, Model } from "sequelize";
import { sequelize } from "../connection.js";
class Provider extends Model {}

Provider.init(
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
    rating: {
      type: DataTypes.FLOAT(),
    },
    total_reviews: {
      type: DataTypes.INTEGER(),
    },
    image: {
      type: DataTypes.TEXT(),
    },
    isVerified: {
      type: DataTypes.BOOLEAN(),
      defaultValue: false,
    },
  },

  {
    sequelize,
    paranoid: true,
  }
);
export default Provider;
