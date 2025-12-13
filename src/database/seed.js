import fs from "fs";
import path from "path";
import { sequelize } from "./connection.js";
import { NODE_ENV } from "../configs/serverConfig.js";

const modelsDir = path.resolve("./database/models");
const dataDir = path.resolve("./database/seeds/data");

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
  return sequelize.models;
}

async function resetPostgresSequence(model) {
  const primaryKeyField = model.primaryKeyAttribute;
  const attribute = model.rawAttributes[primaryKeyField];

  if (!attribute) return;
  if (!["INTEGER", "BIGINT"].includes(attribute.type.key)) return;

  const tableName = model.getTableName();
  const seqName = `"${tableName}_${primaryKeyField}_seq"`;

  const maxId = await model.max(primaryKeyField);
  if (maxId !== null) {
    await sequelize.query(`SELECT setval('${seqName}', ${maxId}, true);`);
    console.log(`🔧 Sequence reset for ${tableName} to ${maxId}`);
  }
}

async function seedAll() {
  const models = await importModels();
  await sequelize.sync({ force: true });

  for (const [name, model] of Object.entries(models)) {
    const filePath = path.join(dataDir, `${name.toLowerCase()}s.json`);
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      await model.bulkCreate(data, { ignoreDuplicates: true });
      console.log(`✅ Seeded ${data.length} rows into ${name}`);

      await resetPostgresSequence(model);
    }
  }

  console.log("🎉 All JSON files seeded successfully!");
  process.exit(0);
}

if (NODE_ENV !== "production") await seedAll();
