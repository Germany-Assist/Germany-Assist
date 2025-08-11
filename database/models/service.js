import { DataTypes, Model } from "sequelize";
import { sequelize } from "../connection.js";
class Service extends Model {}

Service.init(
  {
    title: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT(),
      allowNull: false,
    },
    UserId: {
      type: DataTypes.INTEGER(),
    },
    ProviderId: {
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
    ContractId: {
      type: DataTypes.INTEGER(),
    },
    image: {
      type: DataTypes.TEXT(),
    },
  },
  {
    sequelize,
    paranoid: true,
  }
);
export default Service;
