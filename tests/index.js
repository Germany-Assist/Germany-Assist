import { execSync } from "node:child_process";
import { sequelize } from "../src/database/connection.js";
import { server } from "../src/app.js";
import { errorLogger, infoLogger } from "../src/utils/loggers.js";
import fs from "fs";

try {
  infoLogger(
    "🚀 Tests will run sequentially and synchronously to avoid conflicts 🚀"
  );

  const testFolders = fs.readdirSync("./tests", { withFileTypes: true });
  const skipFiles = [];

  for (const testFolder of testFolders) {
    if (testFolder.isDirectory()) {
      const folderName = testFolder.name;
      console.log(`Running ${testFolder.name} Tests`);
      const files = fs.readdirSync(`./tests/${folderName}`);
      for (const file of files) {
        if (
          file === "index.js" ||
          !file.endsWith(".test.js") ||
          skipFiles.includes(file.split(".")[0])
        ) {
          continue;
        }

        infoLogger(`🚀 Running ${file.split(".")[0]} tests...`);

        const cmd = process.env.WORKFLOW_TEST
          ? `node --test tests/${folderName}/${file}`
          : `node --trace-warnings --env-file=test.env --test tests/${folderName}/${file}`;

        execSync(cmd, { stdio: "inherit" });

        console.log(
          `\n ✅ just finished Running ${file.split(".")[0]} tests...`
        );
      }
    } else if (testFolder.isFile()) {
      // handle root-level test files directly
      const file = testFolder.name;
      if (
        file === "index.js" ||
        !file.endsWith(".test.js") ||
        skipFiles.includes(file.split(".")[0])
      ) {
        continue;
      }

      infoLogger(`🚀 Running ${file.split(".")[0]} tests...`);

      const cmd = process.env.WORKFLOW_TEST
        ? `node --test tests/${file}`
        : `node --env-file=test.env --test tests/${file}`;

      execSync(cmd, { stdio: "inherit" });

      console.log(`\n ✅ just finished Running ${file.split(".")[0]} tests...`);
    }
  }

  console.log(" \n ✅ All tests complete.");
} catch (err) {
  errorLogger(err);
  process.exit(1);
} finally {
  await sequelize.close();
  server.close();
}
