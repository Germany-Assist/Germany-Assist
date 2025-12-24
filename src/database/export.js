import fs from "fs";
import path from "path";
import { sequelize } from "../../configs/database.js";
import { NODE_ENV } from "../configs/serverConfig.js";

const modelsDir = path.resolve("./database/models");
async function importModels() {
  const files = fs
    .readdirSync(modelsDir)
    .filter((f) => f.endsWith(".js") && f !== "index.js");
  for (const file of files) {
    const modelImport = await import(path.join(modelsDir, file));
    const model = modelImport.default;
    if (model.init) {
      model.init(model.rawAttributes, {
        sequelize,
        paranoid: model.options?.paranoid ?? false,
      });
    }
  }
  console.log("✅ All models imported!");
}

await importModels();

const exportDir = path.resolve("./database/seeds/data");
async function exportAllModels() {
  try {
    // Ensure directory exists
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }
    // Sync model metadata
    await sequelize.authenticate();
    console.log("📦 Connected. Exporting data...");
    // Loop through all loaded models
    for (const [name, model] of Object.entries(sequelize.models)) {
      console.log(`🔹 Exporting ${name}...`);
      const records = await model.findAll({ raw: true });
      const filePath = path.join(exportDir, `${name.toLowerCase()}s.json`);
      fs.writeFileSync(filePath, JSON.stringify(records, null, 2));
      console.log(`✅ ${name}: ${records.length} rows saved → ${filePath}`);
    }
    console.log("\n🎉 All models exported successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error exporting models:", error);
    process.exit(1);
  }
}
if (NODE_ENV !== "production") await exportAllModels();
