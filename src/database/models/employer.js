import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../configs/database.js";
import { v4 as uuidv4 } from "uuid";

class Employer extends Model {}

Employer.init(
  {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: uuidv4,
      unique: true,
      primaryKey: true,
      validate: {
        isUUID: { args: 4, msg: "ID must be a valid UUIDv4" },
      },
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        notEmpty: { msg: "Name cannot be empty" },
        len: {
          args: [3, 200],
          msg: "Name must be between 3 and 200 characters",
        },
      },
    },
    about: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: { msg: "About cannot be empty" },
        len: {
          args: [10, 5000],
          msg: "About must be between 10 and 5000 characters",
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
    views: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      validate: {
        isInt: { msg: "Views must be an integer" },
        min: { args: [0], msg: "Views cannot be negative" },
      },
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: { msg: "Email cannot be empty" },
        isEmail: { msg: "Email must be a valid email address" },
      },
    },
    phoneNumber: {
      type: DataTypes.STRING(20),
      allowNull: true,
      validate: {
        len: {
          args: [7, 20],
          msg: "Phone number must be between 7 and 20 characters",
        },
        is: {
          args: /^[0-9+()-\s]*$/,
          msg: "Phone number contains invalid characters",
        },
      },
    },
    image: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        isUrl: { msg: "Image must be a valid URL" },
      },
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    rating: {
      type: DataTypes.FLOAT,
      allowNull: true,
      validate: {
        min: { args: [0], msg: "Rating cannot be negative" },
        max: { args: [5], msg: "Rating cannot be greater than 5" },
      },
    },
    totalReviews: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      validate: {
        isInt: { msg: "Total reviews must be an integer" },
        min: { args: [0], msg: "Total reviews cannot be negative" },
      },
    },
    owner: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.id;
      },
    },
  },
  {
    sequelize,
    paranoid: true,
  }
);

export default Employer;
