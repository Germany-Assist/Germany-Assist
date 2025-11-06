import { sequelize } from "./connection.js";
import seedUsers from "./seeds/users_seeds.js";
import seedPermissions from "./seeds/permission_seed.js";
import seedCategory from "./seeds/category_seed.js";
import { NODE_ENV } from "../configs/serverConfig.js";
import { errorLogger } from "../utils/loggers.js";
import { defineConstrains } from "./dbIndex.js";
export async function initialSeed() {
  try {
    if (NODE_ENV === "production")
      throw new Error(
        "should not run this script in the production environment"
      );
    await seedPermissions();
    await seedUsers();
    await seedCategory();
  } catch (error) {
    errorLogger(error);
  }
}
export async function initDatabase() {
  //Stage 1
  await sequelize.authenticate();
  //Creates the skeleton
  console.log("creating skeleton ⌛");
  await sequelize.sync({ force: true });
  console.log("skeleton was created 👍");
  //Stage 2
  //Seeds the data
  console.log("starting to seeds ⌛");
  await initialSeed();
  console.log("finished seeding 👍");
  //Stage 3
  //Apply the constraints
  console.log("defining constrains ⌛");
  await sequelize.sync({ alter: true });
  defineConstrains();
  await sequelize.sync({ alter: true });
  console.log("constrains are ready 👍");
}
try {
  if (process.env.NODE_ENV !== "production") {
    await initDatabase();
    console.log("script has successful migrated and seeded the database 😀");
    if (process.env.TEST_RUNNER !== "vscode") {
      await sequelize.close();
      process.exit();
    }
  }
} catch (error) {
  console.log(error);
  console.error(error.message);
}
