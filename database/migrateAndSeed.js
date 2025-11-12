import { sequelize } from "./connection.js";
import seedUsers from "./seeds/users_seeds.js";
import seedPermissions from "./seeds/permission_seed.js";
import seedCategory from "./seeds/category_seed.js";
import { defineConstrains } from "./dbIndex.js";
import { NODE_ENV } from "../configs/serverConfig.js";
import { tryCatch } from "bullmq";
export async function initDatabase(exit = true) {
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
      console.log("finished seeding 👍");
      //Stage 3
      //Apply the constraints
      console.log("defining constrains ⌛");
      try {
        defineConstrains();
      } catch (error) {
        if (NODE_ENV === "dev") {
          throw new Error("failed to define constrains");
        }
      }
      await sequelize.sync({ alter: true });
      console.log("constrains are ready 👍");
      if (exit) {
        await sequelize.close();
        process.exit();
      }
      console.log("script has successful migrated and seeded the database 😀");
    } else {
      throw new Error(
        "should not run this script in the production environment"
      );
    }
  } catch (error) {
    console.log(error);
  }
}
if (NODE_ENV === "dev") {
  await initDatabase();
}
