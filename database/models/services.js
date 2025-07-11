import { DataTypes, Model } from "sequelize";
import { sequelize } from "../connection.js";
class Services extends Model {}

Services.init(
  {
    title: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT(),
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER(),
    },
    providersProfileId: {
      type: DataTypes.INTEGER(),
    },
    views: {
      type: DataTypes.INTEGER(),
    },
    type: {
      type: DataTypes.STRING(),
      allowNull: false,
    },
    rating: {
      type: DataTypes.INTEGER(),
    },
    total_reviews: {
      type: DataTypes.INTEGER(),
    },
    price: {
      type: DataTypes.FLOAT(),
      allowNull: false,
    },
    contractId: {
      type: DataTypes.INTEGER(),
    },
    image: {
      type: DataTypes.TEXT(),
    },
  },
  {
    sequelize,
    paranoid: true,
    modelName: "services",
  }
);
export default Services;
