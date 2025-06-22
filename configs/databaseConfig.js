import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve("dev.env") });

export const DB_USERNAME = process.env.DB_USERNAME || "";
export const DB_PASSWORD = process.env.DB_PASSWORD || "";
export const DB_NAME = process.env.DB_NAME || "";
export const DB_HOST = process.env.DB_HOST || "";
export const DB_PORT = Number(process.env.DB_PORT) || 5432;
export const DB_DIALECT = process.env.DB_DIALECT || "postgres";
