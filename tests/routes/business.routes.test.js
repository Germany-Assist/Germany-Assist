import request from "supertest";
import { app } from "../../app.js";
import db from "../../database/dbIndex.js";
import { businessFactory } from "../factories/business.factory.js";
import { before, beforeEach, describe, it } from "node:test";
import assert from "node:assert";
import { alterUserVerification } from "../../services/user.services.js";
import hashIdUtil from "../../utils/hashId.util.js";

describe("Business Routes Integration/E2E", () => {
  beforeEach(async () => {
    await db.UserPermission.destroy({ where: {}, force: true });
    await db.User.destroy({ where: {}, force: true });
    await db.Business.destroy({ where: {}, force: true });
  });
  it("should create a business via POST /api/business", async () => {
    const res = await request(app).post("/api/business").send({
      name: "Test Business",
      email: "test@biz.com",
      description: "Default description",
      about: "About business",
      password: "123456789@Abc",
      phone_number: "123456789",
    });
    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.business.name, "Test Business");
    const resGet = await request(app).get(
      `/api/business/${res.body.business.id}`
    );
    assert.strictEqual(resGet.status, 200);
    assert.strictEqual(resGet.body.name, "Test Business");
  });
  it("should retrieve a business via GET /api/business/:id", async () => {
    const biz = await businessFactory({ name: "what ever" });
    const resGet = await request(app).get(`/api/business/${biz.id}`);
    assert.strictEqual(resGet.status, 200);
    assert.strictEqual(resGet.body.name, "what ever");
  });
  it("should retrieve all business", async () => {
    const bizs = ["business1", "business2", "business3"];
    bizs.forEach(async (i) => {
      await businessFactory({ email: `${i}@testing.com`, name: i });
    });
    const resp = await request(app).get(`/api/business`);
    assert.strictEqual(resp.status, 200);
    assert.ok(Array.isArray(resp.body));
    assert.equal(resp.body.length, 3);
  });
  it("should delete business", async () => {
    const res = await request(app).post("/api/business").send({
      name: "Test Business",
      email: "test@biz.com",
      description: "Default description",
      about: "About business",
      password: "123456789@Abc",
      phone_number: "123456789",
    });
    assert.strictEqual(res.status, 201);
    await alterUserVerification(
      hashIdUtil.hashIdDecode(res.body.user.id),
      true
    );
    const deleted = await request(app)
      .delete("/api/business")
      .send({ id: res.body.business.id })
      .set("Authorization", `Bearer ${res.body.accessToken}`);
    assert.strictEqual(deleted.status, 200);
  });
});
