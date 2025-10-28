import { DataTypes, Model } from "sequelize";
import { sequelize } from "../connection.js";

class Post extends Model {}

Post.init(
  {
    description: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: { msg: "Description cannot be empty" } },
    },
    attachments: {
      type: DataTypes.JSONB,
    },
    //creator
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: { msg: "user_id must be an integer" },
        min: { args: [1], msg: "user_id must be greater than 0" },
      },
    },
    timeline_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: { msg: "timeline_id must be an integer" },
        min: { args: [1], msg: "timeline_id must be greater than 0" },
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
  }
);
export default Post;
