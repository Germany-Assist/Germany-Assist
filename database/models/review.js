import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../database/connection.js";
import User from "./User.js";

class Review extends Model {}

Review.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
      onDelete: "CASCADE",
    },
    rating: {
      type: DataTypes.DECIMAL(2, 1),
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
      },
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    targetId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    target_type_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Reviews",
    table: "reviews",
    timestamps: true,
    underscored: true,
  },

  /**
   * Define the assoicaition relationship between users and reviewers
   */

  (Review.associate = (models) => {
    Review.belongsTo(model.User, {
      foreignKey: userId,
      as: "user",
    });
  })
);

export default Review;
