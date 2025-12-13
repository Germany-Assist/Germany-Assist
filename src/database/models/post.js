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
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: { msg: "Description cannot be empty" } },
    },
    //attachments are an array of objects
    // example [{name:"background"},{url:"blablablabla.bla"}]
    attachments: {
      type: DataTypes.JSONB,
      allowNull: true,
      validate: {
        isArrayOfObjects(value) {
          if (value === null) return; // allow null
          if (!Array.isArray(value)) {
            throw new Error("Attachments must be an array");
          }
          for (const item of value) {
            if (typeof item !== "object" || Array.isArray(item)) {
              throw new Error("Each attachment must be an object");
            }
            if (!item.url || typeof item.url !== "string") {
              throw new Error(
                "Each attachment must include a valid 'url' string"
              );
            }
            if (item.name && typeof item.name !== "string") {
              throw new Error(
                "'name' in attachment must be a string if provided"
              );
            }
          }
        },
      },
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
