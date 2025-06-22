import { Sequelize } from "sequelize";
import * as db_params from "./../configs/databaseConfig.js";

console.log("Dialect:", db_params.DB_DIALECT);

export const sequelize = new Sequelize(db_params.DB_NAME, db_params.DB_USERNAME, db_params.DB_PASSWORD, {
  host: db_params.DB_HOST,
  port: db_params.DB_PORT,
  dialect: 'postgres',  
  logging: false,
});
