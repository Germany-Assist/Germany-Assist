import User from "./models/user.js";
import Business from "./models/business.js";
import Provider from "./models/provider.js";
import Services from "./models/service.js";
import Asset from "./models/assets.js";
import Contract from "./models/contract.js";
import Review from "./models/review.js";
import Coupon from "./models/coupon.js";
import Chat from "./models/chat.js";
import UsersServices from "./models/onlyToSeed_users_services.js";

export const defineConstarins = () => {
  Asset.belongsTo(Services);
  Asset.belongsTo(Business);
  Asset.belongsTo(Provider);

  User.hasMany(Asset);
  User.hasMany(Review);

  Services.belongsTo(Contract);
  Services.belongsTo(Provider);
  Services.hasMany(Review);

  //user can be the root acount for multiple businesses or providers
  User.hasMany(Business);
  User.hasMany(Provider);

  // the id of the creator
  User.hasMany(Services);

  //user has many services in type : favourit, requested
  User.belongsToMany(Services, {
    through: UsersServices,
    foreignKey: "userId",
    otherKey: "serviceId",
    unique: false,
  });
  Services.belongsToMany(User, {
    through: UsersServices,
    foreignKey: "serviceId",
    otherKey: "userId",
    unique: false,
  });
  Provider.hasMany(Services);
  Provider.hasMany(Asset);
  Provider.hasMany(Review);
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
  Services,
  Asset,
  Contract,
  Review,
  Coupon,
  Chat,
};

export default db;
