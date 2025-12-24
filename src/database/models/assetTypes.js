import { Model, DataTypes } from "sequelize";
import { sequelize } from "../../configs/database.js";

class AssetTypes extends Model {}

AssetTypes.init(
  {
    key: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    limit: {
      type: DataTypes.STRING, // '*' or numeric string
      allowNull: false,
    },
    basekey: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    size: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    thumb: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    mediaType: {
      type: DataTypes.ENUM("image", "video", "document", "other"),
      allowNull: false,
    },
    ownerType: {
      type: DataTypes.ENUM(
        "user",
        "serviceProvider",
        "service",
        "post",
        "employer"
      ),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "AssetTypes",
  }
);

export default AssetTypes;
