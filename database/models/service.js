import { DataTypes, Model } from "sequelize";
import { sequelize } from "../connection.js";

class Service extends Model {}

Service.init(
  {
    title: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: { msg: "Title cannot be empty" },
        len: {
          args: [3, 50],
          msg: "Title must be between 3 and 50 characters",
        },
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: { msg: "Description cannot be empty" },
        len: {
          args: [10, 5000],
          msg: "Description must be between 10 and 5000 characters",
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
      allowNull: false,
      validate: {
        isUUID: { args: 4, msg: "BusinessId must be a valid UUIDv4" },
      },
    },
    views: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      validate: {
        isInt: { msg: "Views must be an integer" },
        min: { args: [0], msg: "Views cannot be negative" },
      },
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: "Type cannot be empty" },
        isIn: {
          args: [["product", "service", "subscription"]],
          msg: "Type must be one of: product, service, subscription",
        },
      },
    },
    rating: {
      type: DataTypes.FLOAT,
      allowNull: true,
      validate: {
        isNumeric: { msg: "Rating must be a number" },
        min: { args: [0], msg: "Rating cannot be negative" },
        max: { args: [5], msg: "Rating cannot be greater than 5" },
      },
    },
    total_reviews: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      validate: {
        isInt: { msg: "Total reviews must be an integer" },
        min: { args: [0], msg: "Total reviews cannot be negative" },
      },
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        isFloat: { msg: "Price must be a valid number" },
        min: { args: [0], msg: "Price cannot be negative" },
      },
    },
    contract_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        isInt: { msg: "Contract Id must be an integer" },
        min: { args: [1], msg: "Contract Id must be greater than 0" },
      },
    },
    image: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        isUrl: { msg: "Image must be a valid URL" },
      },
    },
    approved: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    rejected: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    published: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    owner: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.service_provider_id;
      },
    },
  },
  {
    sequelize,
    paranoid: true,
  }
);

export default Service;
