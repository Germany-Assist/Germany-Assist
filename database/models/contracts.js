import { DataTypes, Model } from "sequelize";
import { sequelize } from "../connection.js";
class Contracts extends Model {}

Contracts.init(
  {
    name: {
      type: DataTypes.CHAR(50),
      allowNull: false,
    },
    about: {
      type: DataTypes.TEXT(),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT(),
      allowNull: false,
    },
    requests: {
      type: DataTypes.INTEGER(),
    },
    contract: {
      type: DataTypes.JSON(),
      allowNull: false,
    },
  },
  {
    sequelize,
    paranoid: true,
    modelName: "contracts",
  }
);
export default Contracts;
