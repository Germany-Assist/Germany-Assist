import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../configs/database.js";

class Review extends Model {}

Review.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    body: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: {
          args: [0, 500],
          msg: "Review body cannot exceed 500 characters",
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
        return this.user_id;
      },
    },
  },
  {
    sequelize,
    paranoid: true,
    indexes: [
      {
        unique: true,
        fields: ["user_id", "service_id"],
      },
    ],
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
