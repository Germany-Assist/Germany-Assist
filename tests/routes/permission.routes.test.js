import request from "supertest";
import { app } from "../../src/app.js";
import db from "../../src/database/index.js";
import { after, before, beforeEach, describe, it } from "node:test";
import assert from "node:assert";
import hashIdUtil from "../../src/utils/hashId.util.js";
import { initDatabase } from "../../src/database/migrateAndSeed.js";
import { errorLogger } from "../../src/utils/loggers.js";

beforeEach(async () => {
  try {
    await initDatabase(false);
  } catch (error) {
    errorLogger(error);
  }
});
after(async () => {
  try {
    await app?.close();
  } catch (error) {
    errorLogger(error);
  }
});
describe("Tests the permission ", () => {
  it("should try to access unauthorized resource protected route", async () => {});
});
