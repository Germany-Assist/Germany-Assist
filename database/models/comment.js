import { DataTypes, Model } from "sequelize";
import { sequelize } from "../connection.js";

class Comment extends Model {}

Comment.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: { msg: "user id must be a integer" },
      },
    },
    post_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: { msg: "post id must be a integer" },
      },
    },
    parent_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        isInt: { msg: "parent id must be a integer" },
      },
    },
    body: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Comment cannot be empty",
        },
        len: {
          args: [2, 500],
          msg: "Comment must be between 2 and 500 characters",
        },
      },
    },
  },
  {
    sequelize,
    paranoid: true,
  }
);

export default Comment;
