import { Model, DataTypes } from "sequelize";
import { sequelize } from "../connection.js";

class Category extends Model {}
Category.init(
  {
    title: { type: DataTypes.STRING, allowNull: false },
    label: { type: DataTypes.STRING, allowNull: false },
    contract_template: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    variables: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
    },
  },
  {
    sequelize,
    paranoid: true,
  }
);
export default Category;
