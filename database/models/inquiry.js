import { DataTypes, Model } from "sequelize";
import { sequelize } from "../connection.js";

export default class Inquiry extends Model {}

Inquiry.init(
  {
    //the client
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    //the requested service
    service_id: { type: DataTypes.INTEGER, allowNull: false },
    // //the service provider id just for convince so it can facilitate the owner
    service_provider_id: { type: DataTypes.UUID, allowNull: false },
    // description that holds the first message if needed
    message: { type: DataTypes.TEXT, allowNull: true },
    //status
    status: { type: DataTypes.ENUM("pending", "approved", "rejected") },
    //order in case of approval
    order_id: { type: DataTypes.INTEGER, allowNull: true },
    owner: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.service_provider_id;
      },
    },
  },
  { sequelize, paranoid: false }
);
