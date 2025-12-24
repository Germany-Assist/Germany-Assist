import sinon from "sinon";
import assert from "node:assert";
import { describe, it, beforeEach, afterEach } from "node:test";

import userController, {
  cookieOptions,
} from "../../src/modules/user/user.controller.js";
import userServices from "../../src/modules/user/user.services.js";
import permissionServices from "../../src/modules/permission/permission.services.js";
import authUtils from "../../src/utils/authorize.util.js";
import bcryptUtil from "../../src/utils/bcrypt.util.js";
import hashIdUtil from "../../src/utils/hashId.util.js";
import jwt from "../../src/middlewares/jwt.middleware.js";
import { sequelize } from "../../src/configs/database.js";
import { AppError } from "../../src/utils/error.class.js";
import { roleTemplates } from "../../src/database/templates.js";

describe("User Controller", () => {
  let sandbox, req, res, next, fakeTransaction;
  const fakeUser = {
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    password: "Pas@123",
    dob: "1990-01-01",
    image: "profile.png",
  };

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    req = {
      body: { ...fakeUser },
      auth: { id: 1, role: "super_admin", relatedId: null },
    };
    res = {
      status: sandbox.stub().returnsThis(),
      json: sandbox.stub().returnsThis(),
      cookie: sandbox.stub().returnsThis(),
      send: sandbox.stub().returnsThis(),
      sendStatus: sandbox.stub().returnsThis(),
    };
    next = sandbox.stub();
    fakeTransaction = { commit: sandbox.stub(), rollback: sandbox.stub() };

    // --- Stubs
    sandbox.stub(sequelize, "transaction").resolves(fakeTransaction);
    sandbox.stub(authUtils, "checkRoleAndPermission").resolves(true);
    sandbox.stub(bcryptUtil, "hashPassword").callsFake((p) => `hashed-${p}`);
    sandbox.stub(userServices, "createUser").resolves({
      id: 1,
      ...fakeUser,
      UserRole: { role: "client", relatedType: "client", relatedId: null },
    });
    sandbox.stub(userServices, "loginUser").resolves({
      id: 1,
      ...fakeUser,
      UserRole: { role: "client", relatedType: "client", relatedId: null },
    });
    sandbox.stub(permissionServices, "initPermissions").resolves(true);
    sandbox
      .stub(jwt, "generateTokens")
      .returns({ accessToken: "access", refreshToken: "refresh" });
    sandbox.stub(hashIdUtil, "hashIdEncode").callsFake((id) => `hash-${id}`);
  });

  afterEach(() => sandbox.restore());

  // ----------------------
  // Test: createClientController
  // ----------------------
  it("createClientController should create a client", async () => {
    req.auth = undefined;
    await userController.createClientController(req, res, next);

    sinon.assert.calledOnce(bcryptUtil.hashPassword);
    sinon.assert.calledOnce(userServices.createUser);
    sinon.assert.calledOnce(permissionServices.initPermissions);
    sinon.assert.calledOnce(jwt.generateTokens);
    sinon.assert.calledWith(
      res.cookie,
      "refreshToken",
      "refresh",
      cookieOptions
    );
    sinon.assert.calledWith(res.status, 201);
    sinon.assert.calledOnce(fakeTransaction.commit);
  });

  it("createClientController should rollback on error", async () => {
    userServices.createUser.rejects(new AppError(500, "DB Error"));
    await userController.createClientController(req, res, next);
    sinon.assert.calledOnce(fakeTransaction.rollback);
    sinon.assert.calledOnce(next);
  });

  // ----------------------
  // Test: createAdminController
  // ----------------------
  it("createAdminController should create admin", async () => {
    await userController.createAdminController(req, res, next);
    sinon.assert.calledOnce(userServices.createUser);
    sinon.assert.calledWith(
      permissionServices.initPermissions,
      1,
      roleTemplates.admin,
      fakeTransaction
    );
    sinon.assert.calledWith(res.status, 201);
    sinon.assert.calledOnce(fakeTransaction.commit);
  });

  // ----------------------
  // Test: createRepController
  // ----------------------
  it("createRepController should create a rep", async () => {
    req.auth.role = "service_provider_root";
    req.auth.relatedId = 100;
    await userController.createRepController(req, res, next);
    sinon.assert.calledOnce(userServices.createUser);
    sinon.assert.calledOnce(permissionServices.initPermissions);
    sinon.assert.calledWith(res.status, 201);
    sinon.assert.calledOnce(fakeTransaction.commit);
  });

  // ----------------------
  // Test: createRootAccount
  // ----------------------
  it("createRootAccount should create root account", async () => {
    const result = await userController.createRootAccount(
      "email@test.com",
      "1234",
      null,
      "serviceProvider",
      fakeTransaction
    );
    assert.strictEqual(result.accessToken, "access");
    assert.strictEqual(result.refreshToken, "refresh");
  });

  // ----------------------
  // Test: loginUserController
  // ----------------------
  it("loginUserController should login user", async () => {
    await userController.loginUserController(req, res, next);
    sinon.assert.calledOnce(userServices.loginUser);
    sinon.assert.calledOnce(jwt.generateTokens);
    sinon.assert.calledWith(res.status, 200);
  });

  it("loginUserController should call next on error", async () => {
    userServices.loginUser.rejects(new AppError(500, "Login failed"));
    await userController.loginUserController(req, res, next);
    sinon.assert.calledOnce(next);
  });

  // ----------------------
  // Test: loginUserTokenController
  // ----------------------
  it("loginUserTokenController should return sanitized user", async () => {
    userServices.getUserById = sandbox.stub().resolves({
      ...fakeUser,
      UserRole: { role: "client", relatedType: "client", relatedId: null },
    });
    await userController.loginUserTokenController(req, res, next);
    sinon.assert.calledOnce(res.send);
  });

  // ----------------------
  // Test: refreshUserToken
  // ----------------------
  it("refreshUserToken should return access token", async () => {
    req.cookies = { refreshToken: "token" };
    jwt.verifyRefreshToken = sandbox.stub().returns({ id: 1 });
    jwt.generateAccessToken = sandbox.stub().returns("newAccess");
    userServices.getUserById = sandbox.stub().resolves({ id: 1 });
    await userController.refreshUserToken(req, res, next);
    sinon.assert.calledWith(res.send, { accessToken: "newAccess" });
  });

  it("refreshUserToken should 401 if no token", async () => {
    req.cookies = {};
    await userController.refreshUserToken(req, res, next);
    sinon.assert.calledWith(res.sendStatus, 401);
  });

  // ----------------------
  // Test: getUserProfile
  // ----------------------
  it("getUserProfile should return sanitized user", async () => {
    userServices.getUserProfile = sandbox.stub().resolves({
      toJSON: () => ({
        ...fakeUser,
        UserRole: { role: "client", relatedType: "client", relatedId: null },
      }),
    });
    await userController.getUserProfile(req, res, next);
    sinon.assert.calledOnce(res.send);
  });

  // ----------------------
  // Test: getAllUsers
  // ----------------------
  it("getAllUsers should return sanitized users", async () => {
    userServices.getAllUsers = sandbox.stub().resolves([
      {
        ...fakeUser,
        UserRole: {
          role: "client",
          relatedType: "client",
          relatedId: null,
        },
      },
    ]);
    await userController.getAllUsers(req, res, next);
    sinon.assert.calledOnce(res.send);
  });

  // ----------------------
  // Test: getBusinessReps
  // ----------------------
  it("getBusinessReps should return sanitized reps", async () => {
    userServices.getBusinessReps = sandbox.stub().resolves([
      {
        ...fakeUser,
        UserRole: {
          role: "service_provider_rep",
          relatedType: "ServiceProvider",
          relatedId: 100,
        },
      },
    ]);
    await userController.getBusinessReps(req, res, next);
    sinon.assert.calledOnce(res.send);
  });

  // ----------------------
  // Test: verifyUser
  // ----------------------
  it("verifyUser should verify a user", async () => {
    req.params = { id: "123" };
    sandbox.stub(userServices, "alterUserVerification").resolves(true);
    hashIdUtil.hashIdDecode = sandbox.stub().returns(123);
    await userController.verifyUser(req, res, next);
    sinon.assert.calledWith(res.sendStatus, 200);
  });
});
