import { DataTypes, Model } from "sequelize";
import { sequelize } from "../connection.js";

class Asset extends Model {}

Asset.init(
  {
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: { msg: "Name cannot be empty" },
        len: { args: [3, 50], msg: "Name must be between 3 and 50 characters" },
      },
    },
    media_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: { msg: "Media type cannot be empty" },
        isIn: {
          args: [["image", "video", "audio", "document"]],
          msg: "Media type must be one of 'image', 'video', 'audio', 'document'",
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
    service_provider_id: {
      type: DataTypes.UUID,
      allowNull: true,
      validate: {
        isUUID: { args: 4, msg: "Service Provider must be a valid UUIDv4" },
      },
    },
    service_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        isInt: { msg: "ServiceId must be an integer" },
        min: { args: [1], msg: "ServiceId must be greater than 0" },
      },
    },
    post_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        isInt: { msg: "PostId must be an integer" },
        min: { args: [1], msg: "PostId must be greater than 0" },
      },
    },
    type: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: { msg: "Type cannot be empty" },
        len: { args: [3, 50], msg: "Type must be between 3 and 50 characters" },
      },
    },
    url: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: { msg: "URL cannot be empty" },
      },
    },
    views: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      validate: {
        isInt: { msg: "views must be an integer" },
        min: { args: [0], msg: "views cannot be negative" },
      },
    },
    owner: {
      type: DataTypes.VIRTUAL,
      get() {
        if (this.type === "user") {
          return this.user_id;
        } else {
          return this.BusinessId;
        }
      },
    },
  },
  {
    sequelize,
    paranoid: true,
    validate: {},
  }
);

export default Asset;
