import { describe, it, beforeEach, after } from "node:test";
import { app } from "../../src/app.js";
import request from "supertest";
import { errorLogger } from "../../src/utils/loggers.js";
import assert from "node:assert";
import jwtUtils from "../../src/middlewares/jwt.middleware.js";
import { initDatabase } from "../../src/database/migrateAndSeed.js";
import {
  userFactory,
  userWithTokenFactory,
} from "../factories/user.factory.js";
const testUser = {
  firstName: "yousif",
  lastName: "yousif",
  email: "yousif@test21.com",
  password: "Aa@123456",
  dob: "1990-07-13",
  image: "www.image/url.png",
};
Object.freeze(testUser);
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
describe("userRouter.post/ create new client", () => {
  it("should create new client correctly and retrieve the correct data", async () => {
    const resp = await request(app).post("/api/user/").send(testUser);
    const cookies = resp.headers["set-cookie"];
    assert.equal(resp.status, 201);
    assert.partialDeepStrictEqual(resp.body, {
      user: {
        firstName: testUser.firstName,
        lastName: testUser.lastName,
        dob: "1990-07-13T00:00:00.000Z",
        email: testUser.email,
        isVerified: false,
        role: "client",
        relatedType: "client",
        relatedId: null,
      },
    });
    assert.ok(cookies);
    assert.partialDeepStrictEqual(
      jwtUtils.verifyRefreshToken(cookies[0].split(";")[0].split("=")[1]),
      { role: "client", relatedType: "client", relatedId: null }
    );
    assert.partialDeepStrictEqual(
      jwtUtils.verifyAccessToken(resp.body.accessToken),
      { role: "client", relatedType: "client", relatedId: null }
    );
  });
  it("should fail for validation", async () => {
    const resp = await request(app).post("/api/user/").send({
      firstName: "",
      lastName: "",
      email: "",
      password: "Aa@",
      dob: "",
      image: "",
    });
    assert.equal(resp.status, 422);
    assert.deepStrictEqual(resp.body.message.errors, [
      {
        type: "field",
        value: "",
        msg: "First name is required",
        path: "firstName",
        location: "body",
      },
      {
        type: "field",
        value: "",
        msg: "First name must be between 2 and 50 characters",
        path: "firstName",
        location: "body",
      },
      {
        type: "field",
        value: "",
        msg: "First name can only contain letters, spaces, hyphens, and apostrophes",
        path: "firstName",
        location: "body",
      },
      {
        type: "field",
        value: "",
        msg: "Last name is required",
        path: "lastName",
        location: "body",
      },
      {
        type: "field",
        value: "",
        msg: "Last name must be between 2 and 50 characters",
        path: "lastName",
        location: "body",
      },
      {
        type: "field",
        value: "",
        msg: "Last name can only contain letters, spaces, hyphens, and apostrophes",
        path: "lastName",
        location: "body",
      },
      {
        type: "field",
        value: "",
        msg: "Email is required",
        path: "email",
        location: "body",
      },
      {
        type: "field",
        value: "",
        msg: "Invalid email format",
        path: "email",
        location: "body",
      },
      {
        type: "field",
        value: "Aa@",
        msg: "Password must be at least 8 characters long",
        path: "password",
        location: "body",
      },
      {
        type: "field",
        value: "Aa@",
        msg: "Password must contain at least one number",
        path: "password",
        location: "body",
      },
      {
        type: "field",
        value: "",
        msg: "Image must be a valid URL",
        path: "image",
        location: "body",
      },
      {
        type: "field",
        value: "",
        msg: "Image URL must end with .jpg, .jpeg, .png, or .gif",
        path: "image",
        location: "body",
      },
    ]);
  });
  it("should fail for existing email", async () => {
    const user = await userFactory();
    const resp = await request(app)
      .post("/api/user/")
      .send({ ...testUser, email: user.email });
    assert.equal(resp.status, 422);
    assert.deepEqual(resp.body, {
      success: false,
      message: "Resource already exists",
    });
  });
});
describe("userRouter.get/login login with token", async () => {
  it("should login with token", async () => {
    const user = await userWithTokenFactory();
    const resp = await request(app)
      .get("/api/user/login")
      .set("Authorization", `Bearer ${user.accessToken}`);
    assert.equal(resp.statusCode, 200);
  });
});
describe("userRouter.post/login login with username and password", () => {
  it("should login with username and password", async () => {
    const user = await userFactory();
    const res = await request(app).post("/api/user/login").send({
      email: user.email,
      password: user.plainPassword,
    });
    const cookies = res.headers["set-cookie"];
    assert.equal(res.status, 200);
    assert.equal(res.body.user.firstName, user.firstName);
    assert.equal(res.body.user.lastName, user.lastName);
    assert.equal(res.body.user.email, user.email);
    assert.equal(res.body.user.image, user.image);
    assert.equal(res.body.user.role, user.UserRole.role);
    assert.ok(cookies);
    assert.partialDeepStrictEqual(
      jwtUtils.verifyRefreshToken(cookies[0].split(";")[0].split("=")[1]),
      {
        role: user.UserRole.role,
        relatedType: user.UserRole.relatedType,
        relatedId: null,
      }
    );
    assert.partialDeepStrictEqual(
      jwtUtils.verifyAccessToken(res.body.accessToken),
      {
        role: user.UserRole.role,
        relatedType: user.UserRole.relatedType,
        relatedId: null,
      }
    );
  });
  it("should fail for validation wrong password", async () => {
    const user = await userFactory();
    const res = await request(app).post("/api/user/login").send({
      email: user.email,
      password: "test",
    });
    assert.equal(res.status, 401);
    assert.equal(res.body.message, "invalid credentials");
  });
  it("should fail for non existing user", async () => {
    const res = await request(app).post("/api/user/login").send({
      email: "user.email@gmail.com",
      password: "test",
    });
    assert.equal(res.status, 401);
    assert.equal(res.body.message, "invalid credentials");
  });
  it("should fail for validation", async () => {
    const res = await request(app).post("/api/user/login").send({
      email: "",
      password: "",
    });
    assert.equal(res.status, 422);
    assert.deepEqual(res.body.message.errors, [
      {
        type: "field",
        value: "",
        msg: "Email is required",
        path: "email",
        location: "body",
      },
      {
        type: "field",
        value: "",
        msg: "Invalid email format",
        path: "email",
        location: "body",
      },
      {
        type: "field",
        value: "",
        msg: "Password is required",
        path: "password",
        location: "body",
      },
      {
        type: "field",
        value: "",
        msg: "Password must not be empty",
        path: "password",
        location: "body",
      },
    ]);
  });
});
describe("userRouter.post/refresh-token refresh access token", () => {
  it("should send refresh cookie to get a token", async () => {
    const user = await userFactory();
    const login = await request(app).post("/api/user/login").send({
      email: user.email,
      password: user.plainPassword,
    });
    const cookies = login.headers["set-cookie"];
    const res = await request(app)
      .post("/api/user/refresh-token")
      .set("Cookie", cookies)
      .send();
    assert.equal(res.status, 200);
    assert.ok(res.body);
  });
  it("should fail for no cookie", async () => {
    const res = await request(app).post("/api/user/refresh-token").send();
    assert.equal(res.status, 401);
  });
});
describe("userRouter.get/logout logout user", () => {
  it("it should clear the cookie", async () => {
    const res = await request(app).get("/api/user/logout").send();
    const cookies = res.headers["set-cookie"];
    assert.equal(res.status, 200);
    assert.equal(
      cookies[0],
      "refreshToken=; Path=/api/user/refresh-token; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Strict"
    );
  });
});
//flag further testing on profile will be
describe("userRouter.get/profile get user profile", () => {
  it("should get user profile", async () => {
    const user = await userWithTokenFactory();
    const resp = await request(app)
      .get("/api/user/profile")
      .set("Authorization", `Bearer ${user.accessToken}`);
    assert.equal(resp.statusCode, 200);
    assert.ok(resp.body);
  });
});
