import { sequelize } from "./connection.js";
import assistsSeed from "./seeds/assists_seeds.js";
import businessProfilesSeed from "./seeds/business_profiles_seeds.js";
import providersProfilesSeed from "./seeds/providers_profiles_seeds.js";
import servicesSeed from "./seeds/services_seeds.js";
import UserBusinessProfilesSeed from "./seeds/users_business_profiles.js";
import UserProvidersProfilesSeed from "./seeds/users_providers_profiles.js";
import seedUsers from "./seeds/users_seeds.js";
import userServicesSeed from "./seeds/users_services_seeds.js";
import reviewSeed from "./seeds/review_seeds.js";
import couponSeed from "./seeds/coupon_seeds.js";
import contractSeed from "./seeds/contracts_seeds.js";

//
//models
import Asset from "./models/assets.js";
import BusinessProfiles from "./models/business_profiles.js";
import Contracts from "./models/contracts.js";
import User from "./models/users.js";
import UserBusinessProfiles from "./models/onlyToSeed_users_business_profiles.js";
import UserProvidersProfiles from "./models/onlyToSeed_users_providers_profiles.js";
import UserServices from "./models/onlyToSeed_users_services.js";
import ProvidersProfile from "./models/providers_profiles.js";
import Services from "./models/services.js";
import Review from "./models/reviews.js";
import Coupon from "./models/coupon.js";
//
//

try {
  if (process.env.NODE_ENV == "test" || process.env.NODE_ENV == "dev") {
    //register the models to create skellton
    console.log("creating skellton");
    await sequelize.sync({ force: true });
    console.log("skellton was created");

    console.log("starting to seeds");
    await seedUsers();
    await businessProfilesSeed();
    await servicesSeed();
    await providersProfilesSeed();
    await assistsSeed();
    await userServicesSeed();
    await UserBusinessProfilesSeed();
    await UserProvidersProfilesSeed();
    await reviewSeed();
    await couponSeed();
    await contractSeed();
    console.log("finnished seeding");

    console.log("defining constrains");
    await import("./dbIndex.js").then((module) => module.defineConstarins());
    await sequelize.sync({ alter: true });
    console.log("constrains are ready");

    await sequelize.close();
    console.log("script has successfuly migrated and seeded the database");
  } else {
    throw new Error("shouldnt run this script in the production enviroment");
  }
} catch (error) {
  console.error(error.message);
}
