import { execSync } from "node:child_process";
import { sequelize } from "../database/connection.js";
import { server } from "../app.js";
import { errorLogger, infoLogger } from "../utils/loggers.js";
import fs from "fs";
try {
  await sequelize.authenticate();

  infoLogger(
    "🚀 Tests will run sequentially and synchronously to avoid conflicts 🚀"
  );
  const testFiles = fs.readdirSync("./tests");
  const skipFiles = [
    "business-integration",
    "user",
    "user-integration",
    "business",
  ];
  testFiles.forEach((file) => {
    if (
      file === "index.js" ||
      file.split(".")[file.split(".").length - 2] !== "test" ||
      skipFiles.includes(file.split(".")[0])
    )
      return;
    infoLogger(`🚀 Running ${file.split(".")[0]} tests...`);
    // the WORKFLOW_TEST refers to the env values cuz they are provided in the wokflow github yml
    if (process.env.WORKFLOW_TEST) {
      execSync(`node --test tests/${file}`, {
        stdio: "inherit",
      });
    } else {
      execSync(`node --env-file=test.env --test tests/${file}`, {
        stdio: "inherit",
      });
    }
    console.log(`\n ✅ just finished Running ${file.split(".")[0]} tests...`);
  });

  console.log(" \n ✅ All tests complete.");
} catch (err) {
  errorLogger(err);
  process.exit(1);
} finally {
  await sequelize.close();
  server.close();
}
