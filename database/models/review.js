import { DataTypes, Model } from "sequelize";
import { sequelize } from "../connection.js";
class Review extends Model {}

Review.init(
  {
    body: {
      type: DataTypes.TEXT(),
      allowNull: true,
    },
    UserId: {
      type: DataTypes.INTEGER(),
      allowNull: false,
    },
    rating: {
      type: DataTypes.INTEGER(),
      allowNull: false,
    },
    ServiceId: {
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
