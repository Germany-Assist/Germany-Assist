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

  // this is amr from the past i will add
  // 1.array to skip
  // 2.array to test (in case u need to test specific things)

  testFiles.forEach((file) => {
    if (file === "index.js") return;
    infoLogger(`🚀 Running ${file.split(".")[0]} tests...`);
    execSync(`node --env-file=test.env --test tests/${file}`, {
      stdio: "inherit",
    });
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
