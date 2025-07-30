// import the seed file here
import { sequelize } from "./connection.js";
import assistsSeed from "./seeds/assists_seeds.js";
import businessProfilesSeed from "./seeds/business_profiles_seeds.js";
import providersProfilesSeed from "./seeds/providers_profiles_seeds.js";
import servicesSeed from "./seeds/services_seeds.js";
import seedUsers from "./seeds/users_seeds.js";
import userServicesSeed from "./seeds/users_services_seeds.js";
import reviewSeed from "./seeds/review_seeds.js";
import couponSeed from "./seeds/coupon_seeds.js";
import contractSeed from "./seeds/contracts_seeds.js";
process.env.SEEDING = true;

///////////////////////////////////////////////////////////////////////
// register the models to create skellton
// this is side effect import please follow
// import the model here
import Asset from "./models/assets.js";
import BusinessProfiles from "./models/business.js";
import Contracts from "./models/contract.js";
import User from "./models/user.js";
import UserServices from "./models/onlyToSeed_users_services.js";
import ProvidersProfile from "./models/provider.js";
import Services from "./models/service.js";
import Review from "./models/review.js";
import Coupon from "./models/coupon.js";
import Chat from "./models/chat.js";

///////////////////////////////////////////////////////////////////////
//
//

try {
  if (process.env.NODE_ENV == "test" || process.env.NODE_ENV == "dev") {
    //Stage 1
    //Creates the skeleton
    console.log("creating skeleton ⌛");
    await sequelize.sync({ force: true });
    console.log("skeleton was created 👍");

    //Stage 2
    //Seeds the data
    if (process.env.NODE_ENV != "test") {
      console.log("starting to seeds ⌛");
      await seedUsers();
      await businessProfilesSeed();
      await providersProfilesSeed();
      await contractSeed();
      await servicesSeed();
      await assistsSeed();
      await userServicesSeed();
      await reviewSeed();
      await couponSeed();
      console.log("finnished seeding 👍");
    }
    //Stage 3
    //Apply the constraints
    console.log("defining constrains ⌛");
    const res = await import("./dbIndex.js").then((module) =>
      module.defineConstarins()
    );
    if (true) await sequelize.sync({ alter: true });

    console.log("constrains are ready 👍");
    await sequelize.close();
    console.log("script has successfuly migrated and seeded the database 😀");
  } else {
    throw new Error("shouldnt run this script in the production enviroment");
  }
  await sequelize.close();
  process.exit();
} catch (error) {
  console.error(error.message);
}
