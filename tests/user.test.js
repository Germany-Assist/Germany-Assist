import { describe, before, after, it } from "node:test";
import { sequelize } from "../database/connection.js";
import { server, app } from "../app.js";
import request from "supertest";
import { errorLogger } from "../utils/loggers.js";
import db from "../database/dbIndex.js";
import { hashPassword } from "../utils/bycrypt.util.js";
import assert from "node:assert";

before(async () => {
  try {
    await sequelize.authenticate();
  } catch (error) {
    errorLogger(error);
  }
});

after(async () => {
  try {
    await sequelize.close();
    server.close();
  } catch (error) {
    errorLogger(error);
  }
});

describe("User Authentication API", () => {
  describe("POST /user - User Registration", () => {
    it("should create a new user with valid data", async () => {
      const response = await request(app).post("/api/user").send({
        firstName: "New",
        lastName: "User",
        email: "new@example.com",
        password: "StrongPassword123!",
        DOB: "1995-05-15",
      });
      assert.strictEqual(response.status, 201);
      assert.strictEqual(typeof response.body.accessToken, "string");
      assert.strictEqual(response.body.user.email, "new@example.com");
    });

    it("should reject invalid email format", async () => {
      const response = await request(app).post("/api/user").send({
        firstName: "New",
        lastName: "User",
        email: "invalid-email",
        password: "StrongPassword123!",
        DOB: "1995-05-15",
      });
      assert.strictEqual(response.status, 422);
      assert.strictEqual(
        response.body.message.errors[0].msg,
        "Invalid email format"
      );
    });

    it("should reject weak passwords", async () => {
      const response = await request(app).post("/api/user").send({
        firstName: "New",
        lastName: "User",
        email: "new@example.com",
        password: "weak",
        DOB: "1995-05-15",
      });
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
      const response = await request(app).post("/api/user/login").send({
        email: "new@example.com",
        password: "StrongPassword123!",
      });
      assert.strictEqual(response.status, 200);
      assert.strictEqual(typeof response.body.accessToken, "string");
      assert.strictEqual(response.body.user.email, "new@example.com");
      const cookies = response.headers["set-cookie"];
      assert(cookies.some((cookie) => cookie.includes("refreshToken")));
    });

    it("should reject invalid credentials", async () => {
      const response = await request(app).post("/api/user/login").send({
        email: "test@example.com",
        password: "WrongPassword123!",
      });
      assert.strictEqual(response.status, 401);
    });
    it("should require email and password", async () => {
      const response = await request(app).post("/api/user/login").send({});
      assert.strictEqual(response.status, 422);
      assert(
        response.body.message.errors.some((e) => e.msg === "Email is required")
      );
      assert(
        response.body.message.errors.some(
          (e) => e.msg === "Password is required"
        )
      );
    });
  });
  describe("GET /api/user/logout", () => {
    it("should clear the refresh token cookie", async () => {
      await request(app).post("/api/user/login").send({
        email: "new@example.com",
        password: "StrongPassword123!",
      });
      const response = await request(app).get("/api/user/logout").expect(200);
      const cookies = response.headers["set-cookie"];
      assert(cookies.some((cookie) => cookie.includes("refreshToken=;")));
    });
  });

  describe("POST /api/user/refresh-token", () => {
    it("should issue a new access token with valid refresh token", async () => {
      const loginResponse = await request(app).post("/api/user/login").send({
        email: "new@example.com",
        password: "StrongPassword123!",
      });
      const cookies = loginResponse.headers["set-cookie"] || [];
      const refreshTokenCookie = cookies.find((c) =>
        c.includes("refreshToken=")
      );
      const response = await request(app)
        .post("/api/user/refresh-token")
        .set("Cookie", refreshTokenCookie)
        .expect(200);

      assert.strictEqual(typeof response.body.accessToken, "string");
    });
    it("should reject request without refresh token", async () => {
      await request(app).post("/api/user/refresh-token").expect(401);
    });
  });

  describe("GET /api/user/login - Get Current User", () => {
    it("should return user profile with valid access token", async () => {
      const loginResponse = await request(app).post("/api/user/login").send({
        email: "new@example.com",
        password: "StrongPassword123!",
      });
      const accessToken = loginResponse.body.accessToken;
      const response = await request(app)
        .get("/api/user/login")
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(200);
      assert.strictEqual(response.body.email, "new@example.com");
    });
    it("should reject request without valid access token", async () => {
      await request(app).get("/api/user/login").expect(401);
    });
  });
});
