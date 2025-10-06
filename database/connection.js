import { Sequelize } from "sequelize";
import * as db_params from "./../configs/databaseConfig.js";

export const sequelize = new Sequelize({
  database: db_params.DB_NAME,
  username: db_params.DB_USERNAME,
  port: db_params.DB_PORT,
  password: db_params.DB_PASSWORD,
  host: db_params.DB_HOST,
  dialect: db_params.DB_DIALECT,
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
  define: {
    underscored: true,
  },
});
