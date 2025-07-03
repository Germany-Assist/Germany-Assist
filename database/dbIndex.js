import User from "./models/users.js";
import BusinessProfiles from "./models/business_profiles.js";
import ProvidersProfile from "./models/providers_profiles.js";
import Services from "./models/services.js";
import Asset from "./models/assets.js";
import Contracts from "./models/contracts.js";
import Review from "./models/reviews.js";
import Coupon from "./models/coupon.js";
import Favourit from "./models/users_services_favourit.js";

let associatedDefined=false;

export const defineConstarins = () => {
  
  if(associatedDefined)return;
   associatedDefined=true;
   
  User.belongsToMany(BusinessProfiles, { through: "users_business_profiles" });
  User.belongsToMany(ProvidersProfile, { through: "users_providers_profiles" });
  // for creation
  User.hasMany(Services);
  User.hasMany(Asset);
  User.belongsToMany(Services, { through: "users_services" });
  User.belongsToMany(Services, { through: "users_services_favourit" });
  User.hasMany(Review, { foreignKey: "userId", as: "writtenReviews" });

  BusinessProfiles.belongsToMany(User, { through: "users_business_profiles" });
  BusinessProfiles.hasMany(Asset);

  ProvidersProfile.belongsToMany(User, { through: "users_providers_profiles" });
  ProvidersProfile.hasMany(Services);
  ProvidersProfile.hasMany(Asset);
  ProvidersProfile.hasMany(Review);
  ProvidersProfile.hasMany(Coupon);

  Services.belongsTo(Contracts);
  Services.belongsTo(ProvidersProfile);
  Services.belongsToMany(User, { through: "users_services" });
  Services.belongsToMany(User, { through: "users_services_favourit" });
  Services.hasMany(Review, { foreignKey: "serviceId", as: "serviceReviews" });




  Review.belongsTo(User, { foreignKey: "userId", as: "reviewAuthor" });
  Review.belongsTo(Services, { foreignKey: "serviceId", as: "service" });
 
 
  Asset.belongsTo(BusinessProfiles);
  Asset.belongsTo(ProvidersProfile);
  Asset.belongsTo(Services);
};


// this needs to be edited before production
if (process.env.NODE_ENV == "dev") {
  defineConstarins();
}
const db = {
  User,
  BusinessProfiles,
  ProvidersProfile,
  Services,
  Asset,
  Contracts,
  Review,
  Coupon,
  Favourit,
};

export default db;
