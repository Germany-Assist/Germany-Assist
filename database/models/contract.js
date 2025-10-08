import { DataTypes, Model } from "sequelize";
import { sequelize } from "../connection.js";

class Contract extends Model {}

Contract.init(
  {
    title: {
      type: DataTypes.CHAR(50),
      allowNull: false,
      validate: {
        notEmpty: { msg: "Name cannot be empty" },
        len: { args: [3, 50], msg: "Name must be between 3 and 50 characters" },
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
    contract_template: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    variables: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
    },
    fixed_variables: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    paranoid: true,
  }
);

export default Contract;
