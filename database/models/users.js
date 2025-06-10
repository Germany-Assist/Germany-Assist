import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../database/connection.js";
class User extends Model {}

User.init(
  {
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      // allowNull defaults to true
    },
  },
  {
    sequelize,
    modelName: "User",
  }
);
export default User;
