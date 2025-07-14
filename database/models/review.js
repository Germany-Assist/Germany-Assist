import { DataTypes, Model } from "sequelize";
import { sequelize } from "../connection.js";
class Review extends Model {}

Review.init(
  {
    body: {
      type: DataTypes.TEXT(),
      allowNull: true,
    },
    userId: {
      type: DataTypes.INTEGER(),
      allowNull: false,
    },
    providersProfileId: {
      type: DataTypes.INTEGER(),
      allowNull: false,
    },
    rating: {
      type: DataTypes.INTEGER(),
      allowNull: false,
    },
    serviceId: {
      type: DataTypes.INTEGER(),
      allowNull: false,
    },
  },
  {
    sequelize,
    paranoid: true,
  }
);
export default Review;
