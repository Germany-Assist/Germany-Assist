import { describe, before, after, it, beforeEach, afterEach } from "node:test";
import { app } from "../../app.js";
import request from "supertest";
import { errorLogger } from "../../utils/loggers.js";
import { initDatabase } from "../../database/migrateAndSeed.js";
beforeEach(async () => {
  try {
    await initDatabase(false);
  } catch (error) {
    errorLogger(error);
  }
});
describe("route", () => {
  const route = request(app).post("/api/");
});
describe("route", () => {
  const route = request(app).post("/api/");
  it("", async () => {});
});
