import request from "supertest";
import { app } from "../../app.js";
import db from "../../database/dbIndex.js";
import { businessFactory } from "../factories/business.factory.js";
import { before, describe, it } from "node:test";
import assert from "node:assert";
import { sequelize } from "../../database/connection.js";
import { hashPassword } from "../../utils/bcrypt.util.js";

describe("Business Routes Integration/E2E", () => {
  before(async () => {
    await sequelize.sync({ force: true });
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
  });
  it("should retrieve a business via GET /api/business/:id", async () => {
    const biz = await businessFactory({ name: "Retrieve Biz" });
    const resGet = await request(app).get(`/api/business/${biz.id}`);
    assert.strictEqual(resGet.status, 200);
    assert.strictEqual(resGet.body.name, "Retrieve Biz");
  });
});
