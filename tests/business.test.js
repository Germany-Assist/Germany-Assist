import test, { describe, it, beforeEach, afterEach } from "node:test";
import request from "supertest";
import assert from "node:assert";
import sinon from "sinon";
import { app } from "../app.js";
import userServices from "../services/user.services.js";
import permissionServices from "../services/permission.services.js";
import { verifyAccessToken } from "../middlewares/jwt.middleware.js";
import businessServices from "../services/business.services.js";

let sandbox;

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
const rootStubData = {
  isVerified: true,
  id: 50,
  firstName: "business",
  lastName: "root",
  email: "contacwt@technova.com",
  password: "$2b$10$AOKPqoo3xXzcVAzy4ChLau.nPgi8OBmJRwUszdepa7bnvL6UbomoG",
  role: "root",
  BusinessId: "b75aef98-d8ff-4912-9ee3-eb43d7ae78b0",
  is_root: true,
  DOB: null,
  image: null,
};
const repStubData = {
  isVerified: true,
  id: 50,
  firstName: "business",
  lastName: "rep",
  email: "contacwt@technova.com",
  password: "$2b$10$AOKPqoo3xXzcVAzy4ChLau.nPgi8OBmJRwUszdepa7bnvL6UbomoG",
  role: "rep",
  BusinessId: "b75aef98-d8ff-4912-9ee3-eb43d7ae78b0",
  is_root: false,
  DOB: null,
  image: null,
};
const businessStubData = {
  id: "b75aef98-d8ff-4912-9ee3-eb43d7ae78b0",
  isVerified: true,
  name: "test",
  about: "test.",
  description:
    "We build scalable enterprise solutions with cutting-edge technology, serving clients globally since 2015.",
  email: "contacwt@technova.com",
  phone_number: "+1 (555) 123-4567",
  image: null,
  views: null,
  rating: null,
  total_reviews: null,
};

beforeEach(() => {
  sandbox = sinon.createSandbox();
});

afterEach(() => {
  sandbox.restore();
});

describe("business routes", { timeout: 5000 }, () => {
  describe("create business", () => {
    it("should create business successfully", async () => {
      const initPermissionsStub = sandbox
        .stub(permissionServices, "initPermissions")
        .resolves(true);

      const createUserStub = sandbox
        .stub(userServices, "createUser")
        .resolves(rootStubData);

      const createBusinessStub = sandbox
        .stub(businessServices, "createBusiness")
        .resolves(businessStubData);

      const resp = await request(app).post("/api/business").send(dummyBusiness);
      assert.ok(createUserStub.calledOnce);
      assert.ok(initPermissionsStub.calledOnce);
      assert.ok(createBusinessStub.calledOnce);
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

  describe("create a representative", () => {
    it("should create a representative by the root token", async () => {
      const initPermissionsStub = sandbox
        .stub(permissionServices, "initPermissions")
        .resolves(true);

      const createBusinessStub = sandbox
        .stub(businessServices, "createBusiness")
        .resolves(businessStubData);

      const createUserStub = sandbox
        .stub(userServices, "createUser")
        .onFirstCall()
        .resolves(rootStubData)
        .onSecondCall()
        .resolves(repStubData);

      const getUserByIdStub = sandbox
        .stub(userServices, "getUserById")
        .resolves(rootStubData);

      const root = await request(app).post("/api/business").send(dummyBusiness);

      const rep = await request(app)
        .post("/api/user/rep")
        .set("Authorization", `Bearer ${root.body.accessToken}`)
        .send(dummyRepresentative);
      assert.strictEqual(createUserStub.callCount, 2);
      assert.ok(createBusinessStub.calledOnce);
      assert.ok(getUserByIdStub.calledOnce);
      assert.strictEqual(rep.status, 201);
      assert.strictEqual(rep.body.user.role, "rep");
      assert.strictEqual(rep.body.user.BusinessId, root.body.business.id);
    });
  });
});
