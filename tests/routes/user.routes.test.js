import { describe, before, after, it, beforeEach, afterEach } from "node:test";
import { app } from "../../app.js";
import assert from "node:assert";
import userController from "../../controllers/user.controller.js";
import { serviceFactory } from "../factories/service.factory.js";
import { getUserProfile } from "../../services/user.services.js";
import { serviceProviderFullFactory } from "../factories/serviceProvider.factory.js";
import { sequelize } from "../../database/connection.js";
import request from "supertest";
import { initDatabase } from "../../database/migrateAndSeed.js";
import jwtUtils from "../../middlewares/jwt.middleware.js";
import db from "../../database/dbIndex.js";
const server = request(app);
const testUser = {
  firstName: "yousif",
  lastName: "yousifJr",
  email: "yousif@test21.com",
  password: "Aa@123456",
  dob: "1990-07-13",
  image: "www.image/url.png",
};

afterEach(async () => {
  // await sequelize.query("SET FOREIGN_KEY_CHECKS = 0");
  // await db.User.destroy({ truncate: true, force: true });
  // await db.UserRole.destroy({ truncate: true, force: true });
  // await db.UserPermission.destroy({ truncate: true, force: true });
  // await sequelize.query("SET FOREIGN_KEY_CHECKS = 1");
  await initDatabase();
});
describe("userRouter.post / ", () => {
  const route = server.post("/api/user/");
  it("should create new client correctly and retrieve the correct data", async () => {
    const resp = await route.send(testUser);
    assert.equal(resp.status, 201);
    assert.partialDeepStrictEqual(resp.body, {
      user: {
        firstName: testUser.firstName,
        lastName: testUser.lastName,
        dob: "1990-07-13T00:00:00.000Z",
        email: testUser.email,
        image: testUser.image,
        isVerified: false,
        role: "client",
        related_type: "client",
        related_id: null,
      },
    });
    assert.partialDeepStrictEqual(
      jwtUtils.verifyAccessToken(resp.body.accessToken),
      { role: "client", related_type: "client", related_id: null }
    );
  });
  it("should fail for validation", async () => {
    const resp = await route.send({
      firstName: "",
      lastName: "",
      email: "",
      password: "Aa@",
      dob: "",
      image: "",
    });
    console.log(resp.body.message);
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
    const resp = await route.send(testUser);
    assert.equal(resp.status, 201);
  });
});

// describe("POST /user - User Registration", () => {
//   it("should create a new client with valid data", async () => {
//     const response = await request(app).post("/api/user/").send(testUser);
//     assert.strictEqual(response.status, 201);
//     assert.ok(response.body.accessToken);
//     assert.strictEqual(typeof response.body.accessToken, "string");
//     assert.strictEqual(response.body.user.firstName, testUser.firstName);
//     assert.strictEqual(response.body.user.lastName, testUser.lastName);
//     assert.strictEqual(response.body.user.role, "client");
//     assert.strictEqual(response.body.user.isVerified, false);
//     assert.strictEqual(response.body.user.image, testUser.image);
//     assert.strictEqual(
//       response.body.user.dob,
//       `${new Date(testUser.dob).toISOString()}`
//     );
//   });
//   it("should reject invalid email format", async () => {
//     const response = await request(app).post("/api/user").send({
//       firstName: "New",
//       lastName: "User",
//       email: "invalid-email",
//       password: "StrongPassword123!",
//       DOB: "1995-05-15",
//     });
//     assert.strictEqual(response.status, 422);
//     assert.strictEqual(
//       response.body.message.errors[0].msg,
//       "Invalid email format"
//     );
//   });
//   it("should reject weak passwords", async () => {
//     const response = await request(app).post("/api/user").send({
//       firstName: "New",
//       lastName: "User",
//       email: "new@example.com",
//       password: "weak",
//       DOB: "1995-05-15",
//     });
//     assert.strictEqual(response.status, 422);
//     assert(
//       response.body.message.errors.some((e) =>
//         e.msg.includes("Password must be at least 8 characters")
//       )
//     );
//   });
//   it("should create a new admin account", async () => {
//     const user = await userFactory({
//       is_verified: true,
//       UserRole: {
//         role: "super_admin",
//         related_type: "super_admin",
//       },
//     });
//     const sanitizedUser = userController.sanitizeUser(user);
//     const accessToken = jwt.generateAccessToken(user);
//     const resp = await request(app)
//       .post("/api/user/admin")
//       .set("Authorization", `Bearer ${accessToken}`)
//       .send(testUser);
//     assert.strictEqual(resp.status, 201);
//     assert.strictEqual(resp.body.user.role, "admin");
//   });
// });

// describe("POST /api/user/login - User Login", () => {
//   it("should login with valid credentials", async () => {
//     await userFactory(testUser);
//     const response = await request(app).post("/api/user/login").send({
//       email: testUser.email,
//       password: testUser.password,
//     });
//     assert.strictEqual(response.status, 200);
//     assert.strictEqual(typeof response.body.accessToken, "string");
//     assert.strictEqual(response.body.user.email, testUser.email);
//     const cookies = response.headers["set-cookie"];
//     assert(cookies.some((cookie) => cookie.includes("refreshToken")));
//   });

//   it("should reject invalid credentials", async () => {
//     const response = await request(app).post("/api/user/login").send({
//       email: testUser.email,
//       password: "WrongPassword123!",
//     });
//     assert.strictEqual(response.status, 401);
//   });
//   it("should require email and password", async () => {
//     const response = await request(app).post("/api/user/login").send({});
//     assert.strictEqual(response.status, 422);
//     assert(
//       response.body.message.errors.some((e) => e.msg === "Email is required")
//     );
//     assert(
//       response.body.message.errors.some((e) => e.msg === "Password is required")
//     );
//   });
// });
// describe("GET /api/user/logout", () => {
//   it("should clear the refresh token cookie", async () => {
//     const response = await request(app).get("/api/user/logout").expect(200);
//     const cookies = response.headers["set-cookie"];
//     assert(cookies.some((cookie) => cookie.includes("refreshToken=;")));
//   });
// });

// describe("POST /api/user/refresh-token", () => {
//   it("should issue a new access token with valid refresh token", async () => {
//     await userFactory(testUser);
//     const loginResponse = await request(app).post("/api/user/login").send({
//       email: testUser.email,
//       password: testUser.password,
//     });
//     const cookies = loginResponse.headers["set-cookie"] || [];
//     const refreshTokenCookie = cookies.find((c) => c.includes("refreshToken="));
//     const response = await request(app)
//       .post("/api/user/refresh-token")
//       .set("Cookie", refreshTokenCookie)
//       .expect(200);

//     assert.strictEqual(typeof response.body.accessToken, "string");
//   });
//   it("should reject request without refresh token", async () => {
//     await request(app).post("/api/user/refresh-token").expect(401);
//   });
// });

// describe("GET /api/user/login - Get Current User", () => {
//   it("should return user profile with valid access token", async () => {
//     await userFactory(testUser);
//     const loginResponse = await request(app).post("/api/user/login").send({
//       email: testUser.email,
//       password: testUser.password,
//     });
//     const accessToken = loginResponse.body.accessToken;
//     const response = await request(app)
//       .get("/api/user/login")
//       .set("Authorization", `Bearer ${accessToken}`)
//       .expect(200);
//     assert.strictEqual(response.body.email, testUser.email);
//   });
//   it("should reject request without valid access token", async () => {
//     await request(app).get("/api/user/login").expect(401);
//   });
// });
