import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../configs/database.js";

class Post extends Model {}

Post.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: { notEmpty: { msg: "Description cannot be empty" } },
    },
    isPinned: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    timelineId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: { msg: "timelineId must be an integer" },
        min: { args: [1], msg: "timelineId must be greater than 0" },
      },
    },
  },
  {
    sequelize,
    paranoid: true,
  },
);
export default Post;
