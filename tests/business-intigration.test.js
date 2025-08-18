import test, {
  describe,
  before,
  after,
  it,
  beforeEach,
  afterEach,
} from "node:test";
import { app } from "../app.js";
import request from "supertest";
import { errorLogger } from "../utils/loggers.js";
import db from "../database/dbIndex.js";
import { setTimeout as delay } from "node:timers/promises";
import assert from "node:assert";
import { alterUserVerification } from "../services/user.services.js";
import { hashIdDecode } from "../utils/hashId.util.js";

const dummyBusiness = {
  name: "amr business",
  about: "amrco translate",
  description:
    "We translate with cutting-edge technology, serving clients globally since 2015.",
  email: "what@translate.com",
  phone_number: "+1 (555) 123-4567",
  password: "Aa@123456",
};
const dummyRepresentative = {
  firstName: "rep",
  lastName: "rep",
  email: "rep@rep.com",
  password: "Aa@123456",
  DOB: "1990-07-13",
  image: "www.image/url.png",
};

before(async () => {
  try {
    await db.UserPermission.destroy({ where: {}, force: true });
    await db.User.destroy({ where: {}, force: true });
    await db.Business.destroy({ where: {}, force: true });
  } catch (error) {
    errorLogger(error);
  }
});

describe("business routes", { timeout: 5000 }, () => {
  describe("create business", () => {
    before(async () => {
      await db.UserPermission.destroy({ where: {}, force: true });
      await db.User.destroy({ where: {}, force: true });
      await db.Business.destroy({ where: {}, force: true });
    });
    it("should create business successfully", async () => {
      const resp = await request(app).post("/api/business").send(dummyBusiness);
      assert.strictEqual(resp.status, 201);
      assert.ok(resp.body.user);
      assert.ok(resp.body.accessToken);
      assert.ok(resp.body.business);
      assert.strictEqual(resp.body.user.role, "root");
      assert.strictEqual(resp.body.user.BusinessId, resp.body.business.id);
    });
    it("should reject invalid fields", async () => {
      const resp = await request(app)
        .post("/api/business")
        .send({ ...dummyBusiness, password: "123", about: "" });
      assert.strictEqual(resp.status, 422);
    });
  });
  describe("get businesses", () => {
    let resp1, resp2;
    before(async () => {
      await db.UserPermission.destroy({ where: {}, force: true });
      await db.User.destroy({ where: {}, force: true });
      await db.Business.destroy({ where: {}, force: true });
      resp1 = await request(app).post("/api/business").send(dummyBusiness);
      resp2 = await request(app)
        .post("/api/business")
        .send({ ...dummyBusiness, email: "alternative@test.com" });
      await delay(500);
    });
    it("should get all businesses", async () => {
      const businesses = await request(app).get("/api/business");
      assert.strictEqual(businesses.status, 200);
      assert.ok(Array.isArray(businesses.body));
      assert.strictEqual(businesses.body.length, 2);
    });
    it("should get business by id", async () => {
      const business = await request(app).get(
        `/api/business/${resp1.body.business.id}`
      );
      assert.strictEqual(business.status, 200);
      assert.strictEqual(business.body.name, dummyBusiness.name);
      assert.strictEqual(business.body.about, dummyBusiness.about);
    });
  });
  describe("create a representative", () => {
    let root, rep;
    before(async () => {
      await db.UserPermission.destroy({ where: {}, force: true });
      await db.User.destroy({ where: {}, force: true });
      await db.Business.destroy({ where: {}, force: true });
      root = await request(app).post("/api/business").send(dummyBusiness);
      await alterUserVerification(hashIdDecode(root.body.user.id), true);
    });
    it("should create a representative by the root token", async () => {
      rep = await request(app)
        .post("/api/user/rep")
        .set("Authorization", `Bearer ${root.body.accessToken}`)
        .send(dummyRepresentative);
      assert.strictEqual(rep.status, 201);
      assert.strictEqual(rep.body.user.role, "rep");
      assert.strictEqual(rep.body.user.BusinessId, root.body.business.id);
    });
  });
  describe("delete and restore", () => {
    let root, root2;
    before(async () => {
      await db.UserPermission.destroy({ where: {}, force: true });
      await db.User.destroy({ where: {}, force: true });
      await db.Business.destroy({ where: {}, force: true });
      root = await request(app).post("/api/business").send(dummyBusiness);
      root2 = await request(app)
        .post("/api/business")
        .send({ ...dummyBusiness, email: "alte2@mail.com" });
      await delay(500);
      await alterUserVerification(hashIdDecode(root.body.user.id), true);
      assert.strictEqual(root.status, 201);
      assert.strictEqual(root2.status, 201);
    });

    it("should reject id for invalid permission", async () => {
      const resp = await request(app)
        .delete(`/api/business/${root.body.business.id}`)
        .set("Authorization", `Bearer ${root2.body.accessToken}`);
      assert.strictEqual(resp.status, 403);
    });
    it("should delete a business", async () => {
      const beforeDelete = await request(app).get("/api/business");
      assert.strictEqual(beforeDelete.body.length, 2);
      const resp = await request(app)
        .delete(`/api/business/${root.body.business.id}`)
        .set("Authorization", `Bearer ${root.body.accessToken}`);
      assert.strictEqual(resp.status, 200);
      const afterDelete = await request(app).get("/api/business");
      await delay(500);
      assert.strictEqual(afterDelete.body.length, 1);
    });
  });
});
