import { describe, before, after, it, afterEach } from "node:test";
import { strictEqual } from "node:assert";
import { sequelize } from "../database/connection.js";
import { server, app } from "../app.js";
import request from "supertest";
import { errorLogger } from "../utils/loggers.js";
before(async () => {
  try {
    await sequelize.authenticate();
  } catch (error) {
    errorLogger(error);
  }
});

describe("Test suite", () => {
  it("should return 200 for GET /health", async () => {
    const response = await request(app).get("/health");
    strictEqual(response.status, 200);
  });
  it("should check for GET /api/asset", async () => {
    const response = await request(app).get("/api/asset");
    strictEqual(response.status, 200);
    strictEqual(Array.isArray(response.body), true);
  });
});

after(async () => {
  try {
    await sequelize.close();
    server.close();
  } catch (error) {
    errorLogger(error);
  }
});
