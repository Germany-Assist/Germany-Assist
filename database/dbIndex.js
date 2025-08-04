import User from "./models/user.js";
import Business from "./models/business.js";
import Provider from "./models/provider.js";
import Service from "./models/service.js";
import Asset from "./models/assets.js";
import Contract from "./models/contract.js";
import Review from "./models/review.js";
import Coupon from "./models/coupon.js";
import Chat from "./models/chat.js";
import UsersServices from "./models/onlyToSeed_users_services.js";

export const defineConstarins = () => {
  Asset.belongsTo(Service);
  Asset.belongsTo(Business);
  Asset.belongsTo(Provider);

  User.hasMany(Asset);
  User.hasMany(Review);

  Service.belongsTo(Contract);
  Service.belongsTo(Provider);
  Service.hasMany(Review);

  //user can be the root acount for multiple businesses or providers
  User.hasMany(Business);
  User.hasMany(Provider);

  // the id of the creator
  User.hasMany(Service);

  //user has many services in type : favourit, requested
  User.belongsToMany(Service, {
    through: UsersServices,
    foreignKey: "userId",
    otherKey: "serviceId",
    unique: false,
  });
  Service.belongsToMany(User, {
    through: UsersServices,
    foreignKey: "serviceId",
    otherKey: "userId",
    unique: false,
  });
  Provider.hasMany(Service);
  Provider.hasMany(Asset);
  Provider.hasMany(Coupon);
  Provider.hasMany(Asset);
  return true;
};
if (process.env.SEEDING !== "true") {
  defineConstarins();
}
const db = {
  User,
  Business,
  Provider,
  Service,
  Asset,
  Contract,
  Review,
  Coupon,
  Chat,
};

export default db;
