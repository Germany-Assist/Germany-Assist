import request from "supertest";
import { app } from "../../app.js";
import db from "../../database/dbIndex.js";
import { after, before, beforeEach, describe, it } from "node:test";
import assert from "node:assert";
import hashIdUtil from "../../utils/hashId.util.js";
import { initDatabase } from "../../database/migrateAndSeed.js";

beforeEach(async () => {
  try {
    await initDatabase(false);
  } catch (error) {
    errorLogger(error);
  }
});
after(async () => {
  await app?.close();
});
describe("Tests the permission ", () => {
  it("should try to access unauthorized resource protected route", async () => {});
});
