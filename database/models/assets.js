import { DataTypes, Model } from "sequelize";
import { sequelize } from "../connection.js";
class Asset extends Model {}

Asset.init(
  {
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    media_type: {
      //image,audio,video
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER(),
      allowNull: false,
    },
    businessProfileId: {
      type: DataTypes.INTEGER(),
    },
    providersProfileId: {
      type: DataTypes.INTEGER(),
    },
    serviceId: {
      type: DataTypes.INTEGER(),
    },
    postId: {
      type: DataTypes.INTEGER(),
    },
    type: {
      //bussness_profile , providers_profile , user, post, review
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    url: {
      type: DataTypes.TEXT(),
      allowNull: false,
    },
    requests: {
      type: DataTypes.INTEGER(),
    },
  },
  {
    sequelize,
    paranoid: true,
  }
);
export default Asset;
