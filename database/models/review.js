import { DataTypes, Model } from "sequelize";
import { sequelize } from "../connection.js";

class Review extends Model {}

Review.init(
  {
    body: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: {
          args: [0, 2000],
          msg: "Review body cannot exceed 2000 characters",
        },
      },
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: { msg: "UserId must be an integer" },
        min: { args: [1], msg: "UserId must be greater than 0" },
      },
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: { msg: "Rating must be an integer" },
        min: { args: [1], msg: "Rating must be at least 1" },
        max: { args: [5], msg: "Rating cannot be more than 5" },
      },
    },
    service_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: { msg: "ServiceId must be an integer" },
        min: { args: [1], msg: "ServiceId must be greater than 0" },
      },
    },
    owner: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.UserId;
      },
    },
  },
  {
    sequelize,
    paranoid: true,
    validate: {
      ratingWithoutBody() {
        if (!this.body && this.rating < 3) {
          throw new Error(
            "If rating is less than 3, please provide a review body explaining why"
          );
        }
      },
    },
  }
);

export default Review;
