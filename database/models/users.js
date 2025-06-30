import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../database/connection.js";
class User extends Model {}

User.init(
  {
    firstName: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING(50),
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING(60),
      allowNull: false,
    },
    confirmPassword: {
      type: DataTypes.STRING(60),
      allowNull: false,
    },
    DOP: {
      type: DataTypes.DATE(),
    },
    isVerified: {
      type: DataTypes.BOOLEAN(),
      defaultValue: false,
    },
    image: {
      type: DataTypes.TEXT(),
    },
  },
  {
    sequelize,
    paranoid: true,
    modelName: "users",
  }
);
export default User;
