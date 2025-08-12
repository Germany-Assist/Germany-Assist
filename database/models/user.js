import { DataTypes, Model } from "sequelize";
import { sequelize } from "../connection.js";
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
    DOB: {
      type: DataTypes.DATE(),
    },
    isVerified: {
      type: DataTypes.BOOLEAN(),
      defaultValue: false,
    },
    image: {
      type: DataTypes.TEXT(),
    },
    role: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },
    is_root: {
      type: DataTypes.BOOLEAN(),
      allowNull: false,
    },
    BusinessId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
  },
  {
    sequelize,
    paranoid: true,
  }
);
export default User;
