// import the seed file here
import { sequelize } from "./connection.js";
import seedUsers from "./seeds/users_seeds.js";
import seedPermissions from "./seeds/permission_seed.js";
import seedCategory from "./seeds/category_seed.js";

process.env.SEEDING = true;
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
