import { describe, before, after, it, beforeEach, afterEach } from "node:test";
import { app } from "../../app.js";
import request from "supertest";
import { errorLogger } from "../../utils/loggers.js";
import { defineConstrains } from "../../database/dbIndex.js";
import assert from "node:assert";
import jwtUtils from "../../middlewares/jwt.middleware.js";
import seedUsers from "../../database/seeds/users_seeds.js";
import seedPermissions from "../../database/seeds/permission_seed.js";
import seedCategory from "../../database/seeds/category_seed.js";
import { sequelize } from "../../database/connection.js";
import { initDatabase } from "../../database/migrateAndSeed.js";

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

describe("userRouter.post / ", () => {
  it("should create new client correctly and retrieve the correct data", async () => {
    const resp = await request(app).post("/api/user/").send(testUser);
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
    const resp = await request(app).post("/api/user/").send(testUser);
    assert.equal(resp.status, 201);
  });
});
