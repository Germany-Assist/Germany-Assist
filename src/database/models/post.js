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
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: { msg: "userId must be an integer" },
        min: { args: [1], msg: "userId must be greater than 0" },
      },
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
  }
);
export default Post;
