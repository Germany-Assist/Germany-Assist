import { DataTypes, Model } from "sequelize";
import { sequelize } from "../connection.js";

class Coupon extends Model {}
Coupon.init(
  {
    coupon_code: {
      type: DataTypes.UUID(),
      allowNull: false,
    },
    discount_rate: {
      type: DataTypes.FLOAT(),
      allowNull: false,
    },
    expDate: {
      type: DataTypes.DATE(),
      allowNull: false,
    },
    ProviderId: {
      type: DataTypes.INTEGER(),
      allowNull: false,
    },
  },
  {
    sequelize,
    paranoid: true,
  }
);
export default Coupon;
