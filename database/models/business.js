import { DataTypes, Model } from "sequelize";
import { sequelize } from "../connection.js";
import { v4 as uuidv4 } from "uuid";
class Business extends Model {}

Business.init(
  {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: uuidv4,
      unique: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(200),
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
    views: {
      type: DataTypes.INTEGER(),
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    phone_number: {
      type: DataTypes.STRING(20),
    },
    image: {
      type: DataTypes.TEXT(),
    },
    isVerified: {
      type: DataTypes.BOOLEAN(),
      defaultValue: false,
    },
    rating: {
      type: DataTypes.FLOAT(),
    },
    total_reviews: {
      type: DataTypes.INTEGER(),
    },
  },
  {
    sequelize,
    paranoid: true,
  }
);
export default Business;
