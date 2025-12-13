import { describe, it, beforeEach, after } from "node:test";
import { app } from "../../src/app.js";
import request from "supertest";
import { errorLogger } from "../../src/utils/loggers.js";
import { initDatabase } from "../../src/database/migrateAndSeed.js";
import assert from "node:assert";
import { userAdminFactory } from "../factories/user.factory.js";
import db from "../../src/database/dbIndex.js";
import hashIdUtil from "../../src/utils/hashId.util.js";
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
async function getCatFromDB(filters) {
  return await db.Category.findOne({ where: filters, raw: true });
}
async function createCat(overrides) {
  return await db.Category.create(overrides, { raw: true });
}
const fakeCategory = {
  title: "Other",
  label: "Accepting any other category with flexibility",
};
describe("api/category/ get - get all categories", () => {
  it("should return categories that are added in the seeds", async () => {
    const res = await request(app).get("/api/category");
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body));
    assert.ok(res.body.length > 0);
  });
});

describe("api/category/ post - creates new category", () => {
  it("should create new category successfully", async () => {
    const { accessToken } = await userAdminFactory();
    const res = await request(app)
      .post("/api/category")
      .set("Authorization", `Bearer ${accessToken}`)
      .send(fakeCategory);
    assert.equal(res.statusCode, 201);
    assert.deepEqual(res.body, {
      success: true,
      message: "created category successfully",
    });
    const databaseRes = await getCatFromDB({ title: fakeCategory.title });
    assert.ok(databaseRes);
    assert.equal(databaseRes.label, fakeCategory.label);
  });
  it("should fail for missing access token", async () => {
    const res = await request(app).post("/api/category").send(fakeCategory);
    assert.equal(res.statusCode, 401);
  });
  it("should fail for validation", async () => {
    const { accessToken } = await userAdminFactory();
    const cat = {
      title: "",
      label: "",
    };
    const res = await request(app)
      .post("/api/category")
      .set("Authorization", `Bearer ${accessToken}`)
      .send(cat);
    assert.equal(res.statusCode, 422);
  });
});
describe("api/category/ put - update existing category", () => {
  it("should update successfully", async () => {
    const { accessToken } = await userAdminFactory();
    const existingCat = await createCat(fakeCategory);
    const catId = hashIdUtil.hashIdEncode(existingCat.id);
    const update = await request(app)
      .put("/api/category")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ id: catId, title: "testing" });
    assert.equal(update.statusCode, 201);
    assert.deepEqual(update.body, {
      success: true,
      message: "updated category successfully",
    });
    const databaseRes = await getCatFromDB({ title: "testing" });
    assert.ok(databaseRes);
  });
  it("should fail for missing token", async () => {
    const update = await request(app).put("/api/category");
    // it will result many errors but the first is the token error
    assert.equal(update.statusCode, 401);
  });
});
