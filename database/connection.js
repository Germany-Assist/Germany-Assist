import { Sequelize } from "sequelize";
import * as db_params from "./../configs/databaseConfig.js";

const isProduction = process.env.NODE_ENV === "production";

export const sequelize = new Sequelize({
  database: db_params.DB_NAME,
  username: db_params.DB_USERNAME,
  port: db_params.DB_PORT,
  password: db_params.DB_PASSWORD,
  host: db_params.DB_HOST,
  dialect: db_params.DB_DIALECT,
  logging: false,
  dialectOptions: isProduction
    ? {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      }
    : {}, // No SSL for local
  define: {
    underscored: true,
  },
});
export async function resetDatabase() {
  // Loop over all models registered in Sequelize
  await Promise.all(
    Object.values(sequelize.models).map(async (model) => {
      // Disable triggers to ignore FK constraints
      await sequelize.query(
        `ALTER TABLE "${model.tableName}" DISABLE TRIGGER ALL;`
      );

      // Truncate table and reset auto-increment
      await model.truncate({ cascade: true, restartIdentity: true });

      // Re-enable triggers
      await sequelize.query(
        `ALTER TABLE "${model.tableName}" ENABLE TRIGGER ALL;`
      );
    })
  );

  console.log("All tables truncated and reset successfully!");
}
