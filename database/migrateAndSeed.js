// import the seed file here
import { sequelize } from "./connection.js";
import assistsSeed from "./seeds/assists_seeds.js";
import businessSeed from "./seeds/business_seeds.js";
import servicesSeed from "./seeds/services_seeds.js";
import seedUsers from "./seeds/users_seeds.js";
import userServicesSeed from "./seeds/users_services_seeds.js";
import reviewSeed from "./seeds/review_seeds.js";
import couponSeed from "./seeds/coupon_seeds.js";
import seedContract from "./seeds/contracts_seeds.js";
import seedPermissions from "./seeds/permission_seed.js";
import seedCategory from "./seeds/category_seed.js";

process.env.SEEDING = true;

///////////////////////////////////////////////////////////////////////
// register the models to create skelton
// this is side effect import please follow
// import the model here
import Asset from "./models/assets.js";
import ServiceProvider from "./models/service_provider.js";
import Contracts from "./models/contract.js";
import User from "./models/user.js";
import UserService from "./models/user_service.js";
import Services from "./models/service.js";
import Review from "./models/review.js";
import Coupon from "./models/coupon.js";
import Chat from "./models/chat.js";
import Permission from "./models/permission.js";
import UserRole from "./models/user_role.js";
import UserPermission from "./models/user_permission.js";
import Category from "./models/category.js";
import Inquiry from "./models/inquiry.js";
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
    console.log("starting to seeds ⌛");
    await seedPermissions();
    await seedUsers();
    await seedCategory();
    await seedContract();
    console.log("finished seeding 👍");
    //Stage 3
    //Apply the constraints
    console.log("defining constrains ⌛");
    const res = await import("./dbIndex.js").then((module) =>
      module.defineConstrains()
    );
    if (true) await sequelize.sync({ alter: true });

    console.log("constrains are ready 👍");
    await sequelize.close();
    console.log("script has successful migrated and seeded the database 😀");
  } else {
    throw new Error("should not run this script in the production environment");
  }
  await sequelize.close();
  process.exit();
} catch (error) {
  console.log(error);
  console.error(error.message);
}
