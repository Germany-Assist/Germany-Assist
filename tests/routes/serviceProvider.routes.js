import request from "supertest";
import { app } from "../../app.js";
import db from "../../database/index.js";
import { serviceProviderFactory } from "../factories/serviceProvider.factory.js";
import { before, beforeEach, describe, it } from "node:test";
import assert from "node:assert";
import { alterUserVerification } from "../../services/user.services.js";
import hashIdUtil from "../../utils/hashId.util.js";

describe("Service Provider Routes Integration/E2E", () => {
  beforeEach(async () => {
    await db.UserPermission.destroy({ where: {}, force: true });
    await db.User.destroy({ where: {}, force: true });
    await db.ServiceProvider.destroy({ where: {}, force: true });
  });
  it("should create a serviceProvider via POST /api/serviceProvider", async () => {
    const res = await request(app).post("/api/serviceProvider").send({
      name: "Test serviceProvider",
      email: "test@biz.com",
      description: "Default description",
      about: "About Test",
      password: "123456789@Abc",
      phoneNumber: "123456789",
    });
    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.serviceProvider.name, "Test serviceProvider");
    const resGet = await request(app).get(
      `/api/serviceProvider/${res.body.serviceProvider.id}`
    );
    assert.strictEqual(resGet.status, 200);
    assert.strictEqual(resGet.body.name, "Test serviceProvider");
  });
  it("should retrieve a Service Provider via GET /api/serviceProvider/:id", async () => {
    const biz = await serviceProviderFactory({ name: "what2new" });
    const resGet = await request(app).get(`/api/serviceProvider/${biz.id}`);
    assert.strictEqual(resGet.status, 200);
    assert.strictEqual(resGet.body.name, "what2new");
  });
  it("should retrieve all Service Providers", async () => {
    const bizs = ["sp1", "sp2", "sp3"];
    bizs.forEach(async (i) => {
      await serviceProviderFactory({ email: `${i}@testing.com`, name: i });
    });
    const resp = await request(app).get(`/api/serviceProvider`);
    assert.strictEqual(resp.status, 200);
    assert.ok(Array.isArray(resp.body));
    assert.equal(resp.body.length, 3);
  });
  it("should delete Service Provider", async () => {
    const res = await request(app).post("/api/serviceProvider").send({
      name: "Test serviceProvider",
      email: "test@biz.com",
      description: "Default description",
      about: "About serviceProvider",
      password: "123456789@Abc",
      phoneNumber: "123456789",
    });
    assert.strictEqual(res.status, 201);
  });
});
