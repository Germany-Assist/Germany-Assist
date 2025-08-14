import test, { describe, it, beforeEach, afterEach } from "node:test";
import request from "supertest";
import assert from "node:assert";
import sinon from "sinon";
import { app } from "../app.js";
import userServices from "../services/user.services.js";
import permissionServices from "../services/permission.services.js";
import { verifyAccessToken } from "../middlewares/jwt.middleware.js";

let sandbox;

beforeEach(() => {
  sandbox = sinon.createSandbox();
});

afterEach(() => {
  sandbox.restore();
});

const dummyUser = {
  firstName: "ahmed",
  lastName: "ahmed",
  email: "ahmed@test.com",
  password: "Aa@123456",
  DOB: "1990-07-13",
  image: "www.image/url.png",
};

const userStubData = {
  id: 1,
  isVerified: false,
  firstName: "ahmed",
  lastName: "ahmed",
  email: "ahmed@test.com",
  password: "$2b$10$pD2kJbFyxOc0pInBahwcBuTMyttl44Wj8VQiwB4yO4CqXHgUEe/mK",
  DOB: new Date("1990-07-13T00:00:00.000Z"),
  image: "www.image/url.png",
  role: "client",
  is_root: true,
  BusinessId: null,
};

describe("POST /api/user - User Registration", () => {
  it("should create a new client with valid data", async () => {
    const createUserStub = sandbox
      .stub(userServices, "createUser")
      .resolves(userStubData);

    const initPermissionsStub = sandbox
      .stub(permissionServices, "initPermissions")
      .resolves(true);

    const res = await request(app).post("/api/user").send(dummyUser);

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.user.email, dummyUser.email);
    assert.strictEqual(res.body.user.firstName, dummyUser.firstName);
    assert.strictEqual(res.body.user.lastName, dummyUser.lastName);

    assert.ok(createUserStub.calledOnce);
    assert.ok(initPermissionsStub.calledOnce);

    const decodedToken = verifyAccessToken(res.body.accessToken);
    assert.strictEqual(decodedToken.role, "client");
    assert.strictEqual(decodedToken.BusinessId, null);
    assert.strictEqual(decodedToken.is_root, true);
    assert.strictEqual(decodedToken.id, userStubData.id);

    const cookies = res.headers["set-cookie"];
    assert(cookies.some((cookie) => cookie.includes("refreshToken")));
  });

  it("should reject invalid email format", async () => {
    const response = await request(app)
      .post("/api/user")
      .send({ ...dummyUser, email: "invalid-email" });

    assert.strictEqual(response.status, 422);
    assert.strictEqual(
      response.body.message.errors[0].msg,
      "Invalid email format"
    );
  });

  it("should reject weak passwords", async () => {
    const response = await request(app)
      .post("/api/user")
      .send({ ...dummyUser, password: "weak" });

    assert.strictEqual(response.status, 422);
    assert(
      response.body.message.errors.some((e) =>
        e.msg.includes("Password must be at least 8 characters")
      )
    );
  });
});

describe("POST /api/user/login - User Login", () => {
  it("should login with valid credentials", async () => {
    const loginStub = sandbox
      .stub(userServices, "loginUser")
      .resolves(userStubData);

    const response = await request(app).post("/api/user/login").send({
      email: dummyUser.email,
      password: dummyUser.password,
    });

    assert.strictEqual(response.status, 200);
    assert.strictEqual(typeof response.body.accessToken, "string");
    assert.strictEqual(response.body.user.email, dummyUser.email);

    assert.ok(loginStub.calledOnce);

    const cookies = response.headers["set-cookie"];
    assert(cookies.some((cookie) => cookie.includes("refreshToken")));
  });

  it("should require email and password", async () => {
    const response = await request(app).post("/api/user/login").send({});

    assert.strictEqual(response.status, 422);
    assert(
      response.body.message.errors.some((e) => e.msg === "Email is required")
    );
    assert(
      response.body.message.errors.some((e) => e.msg === "Password is required")
    );
  });
});
