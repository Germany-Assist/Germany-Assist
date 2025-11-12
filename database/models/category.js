import { Model, DataTypes } from "sequelize";
import { sequelize } from "../connection.js";

class Category extends Model {}

Category.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
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
        len: {
          args: [3, 300],
          msg: "Title must be between 3 and 100 characters",
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
