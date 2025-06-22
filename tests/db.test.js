import dotenv from "dotenv";
dotenv.config({ path: "./dev.env" });

import { Client } from "pg";
console.log("ENV Loaded:", {
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
});

const client = new Client({
  user: String(process.env.DB_USERNAME),
  password: String(process.env.DB_PASSWORD),
  database: String(process.env.DB_NAME),
  host: String(process.env.DB_HOST),
  port: parseInt(process.env.DB_PORT, 10),
});

beforeAll(async () => {
  await client.connect();
});

afterAll(async () => {
  await client.end();
});

test("Table User should have the rows", async () => {
  try {
    const res = await client.query('SELECT COUNT(*) FROM "User"');
    const count = parseInt(res.rows[0].count, 10);
    expect(count).toBeGreaterThan(0);
  } catch (err) {
    console.error("DB connection or query failed:", err.message);
    throw err;
  }
});
