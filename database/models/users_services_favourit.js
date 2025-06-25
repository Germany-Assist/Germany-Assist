import { DataTypes, Model } from "sequelize";
import { sequelize } from "../connection.js";

class Favourit extends Model {}
Favourit.init(
  {
    serviceId: {
      type: DataTypes.INTEGER(),
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER(),
      allowNull: false,
    },
  },
  {
    sequelize,
    paranoid: true,
    modelName: "users_services_favourit",
  }
);
export default Favourit;
