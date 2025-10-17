import { Model, DataTypes } from "sequelize";
import { sequelize } from "../connection.js";

class Category extends Model {}

Category.init(
  {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: "Title cannot be empty" },
        len: {
          args: [3, 100],
          msg: "Title must be between 3 and 100 characters",
        },
      },
    },
    label: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        msg: "Label must be unique",
      },
      validate: {
        notEmpty: { msg: "Label cannot be empty" },
      },
    },
    contract_template: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: { msg: "Contract template cannot be empty" },
        len: {
          args: [10, 10000],
          msg: "Contract template should be between 10 and 10000 characters",
        },
      },
    },
    variables: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
      validate: {
        isArrayOfStrings(value) {
          if (!Array.isArray(value)) {
            throw new Error("Variables must be an array of strings");
          }
          if (!value.every((v) => typeof v === "string" && v.trim() !== "")) {
            throw new Error("Each variable must be a non-empty string");
          }
        },
      },
    },
  },
  {
    sequelize,
    paranoid: true,
    tableName: "categories",
  }
);

export default Category;
