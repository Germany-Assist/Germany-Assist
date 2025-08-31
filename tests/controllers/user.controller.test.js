import userController from "../../controllers/user.controller.js";
import sinon from "sinon";
import { describe, it, beforeEach, afterEach, before, after } from "node:test";
import userServices from "../../services/user.services.js";
import permissionServices from "../../services/permission.services.js";
import hashIdUtil from "../../utils/hashId.util.js";
import bcryptUtil from "../../utils/bcrypt.util.js";
import { sequelize } from "../../database/connection.js";
import { AppError } from "../../utils/error.class.js";
import authUtil from "../../utils/authorize.util.js";
import jwt from "../../middlewares/jwt.middleware.js";
import { roleTemplates } from "../../database/templates.js";

describe("Testing Create User Controller", () => {
  let sandbox, req, res, next, fakeTransaction, randomId;
  randomId = 1;
  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = {
      body: {
        firstName: "testing",
        lastName: "testing",
        email: "test@test.com",
        DOB: "1987/6/5",
        password: "test@Pass",
      },
      auth: { id: randomId, BusinessId: randomId },
    };
    next = sandbox.stub();
    fakeTransaction = { commit: sandbox.stub(), rollback: sandbox.stub() };

    res = {
      status: sandbox.stub().returnsThis(),
      json: sandbox.stub().returnsThis(),
      cookie: sandbox.stub().returnsThis(),
    };
    sandbox.stub(authUtil, "checkRoleAndPermission").resolves(true);
    sandbox
      .stub(userServices, "createUser")
      .resolves({ id: randomId, firstName: "testing" });

    sandbox.stub(permissionServices, "initPermissions").resolves();
    sandbox
      .stub(jwt, "generateTokens")
      .returns({ accessToken: "aaa", refreshToken: "bbb" });
    sandbox
      .stub(userController, "sanitizeUser")
      .returns({ id: 1, name: "amr" });
    sandbox.stub(hashIdUtil, "hashIdEncode").returns(randomId);
    sandbox.stub(bcryptUtil, "hashPassword").returns("hashedPass");

    sandbox.stub(sequelize, "transaction").resolves(fakeTransaction);
  });

  afterEach(() => sandbox.restore());

  it("should create a client successfully", async () => {
    await userController.createClientController(req, res, next);
    sandbox.assert.calledOnce(userServices.createUser);
    sandbox.assert.calledOnce(permissionServices.initPermissions);
    sandbox.assert.calledOnce(userController.sanitizeUser);
    sandbox.assert.calledOnce(res.cookie);
    sandbox.assert.calledWith(res.status, 201);
    sandbox.assert.calledOnce(jwt.generateTokens);
    sandbox.assert.calledWith(bcryptUtil.hashPassword, req.body.password);
    sandbox.assert.calledOnce(fakeTransaction.commit);
    sandbox.assert.calledWith(
      userServices.createUser,
      sandbox.match({ UserRole: { role: "client", related_type: "client" } })
    );
    sandbox.assert.calledWith(
      permissionServices.initPermissions,
      randomId,
      roleTemplates.client
    );
  });

  it("should rollback if createUser throws", async () => {
    userServices.createUser.callsFake(() => {
      throw new AppError("DB error");
    });
    await userController.createClientController(req, res, next);
    sandbox.assert.calledOnce(fakeTransaction.rollback);
    sandbox.assert.calledOnce(next);
  });

  it("should create an admin successfully", async () => {
    await userController.createAdminController(req, res, next);
    sandbox.assert.calledOnce(authUtil.checkRoleAndPermission);
    sandbox.assert.calledWith(bcryptUtil.hashPassword, req.body.password);
    sandbox.assert.calledOnce(userServices.createUser);
    sandbox.assert.calledOnce(userController.sanitizeUser);
    sandbox.assert.calledOnce(permissionServices.initPermissions);
    sandbox.assert.calledOnce(jwt.generateTokens);
    sandbox.assert.calledOnce(res.cookie);
    sandbox.assert.calledWith(res.status, 201);
    sandbox.assert.calledOnce(fakeTransaction.commit);
    sandbox.assert.calledWith(
      userServices.createUser,
      sandbox.match({ UserRole: { role: "admin", related_type: "admin" } })
    );
    sandbox.assert.calledWith(
      permissionServices.initPermissions,
      randomId,
      roleTemplates.admin
    );
  });

  it("should rollback if admin createUser throws", async () => {
    userServices.createUser.callsFake(() => {
      throw new AppError("DB error");
    });
    await userController.createAdminController(req, res, next);
    sandbox.assert.calledOnce(fakeTransaction.rollback);
    sandbox.assert.calledOnce(next);
  });
  it("should create a Rep for Service Provider successfully", async () => {
    sandbox.stub(userController, "setRoleAndTypeRep").returns({
      repRole: "service_provider_rep",
      repRelatedType: "ServiceProvider",
    });
    await userController.createRepController(req, res, next);
    sandbox.assert.calledOnce(authUtil.checkRoleAndPermission);
    sandbox.assert.calledWith(bcryptUtil.hashPassword, req.body.password);
    sandbox.assert.calledOnce(userServices.createUser);
    sandbox.assert.calledOnce(permissionServices.initPermissions);
    sandbox.assert.calledOnce(res.cookie);
    sandbox.assert.calledWith(res.status, 201);
    sandbox.assert.calledWith(bcryptUtil.hashPassword, req.body.password);
    sandbox.assert.calledOnce(fakeTransaction.commit);
    sandbox.assert.calledWith(
      userServices.createUser,
      sandbox.match({
        UserRole: {
          role: "service_provider_rep",
          related_type: "ServiceProvider",
        },
      })
    );
    sandbox.assert.calledWith(
      permissionServices.initPermissions,
      randomId,
      roleTemplates.service_provider_rep
    );
  });
  it("should rollback if rep createUser throws", async () => {
    userServices.createUser.callsFake(() => {
      throw new AppError("DB error");
    });
    // or any other error well also work for missing
    // userController.setRoleAndTypeRep stub
    await userController.createRepController(req, res, next);
    sandbox.assert.calledOnce(fakeTransaction.rollback);
    sandbox.assert.calledOnce(next);
  });
});
describe("Testing Login User Controller", () => {
  let sandbox, req, res, next;
  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = { body: { email: "amr@mail.com", password: "Pas@word" } };
    res = {
      cookie: sandbox.stub().returnsThis(),
      json: sandbox.stub().returnsThis(),
      status: sandbox.stub().returnsThis(),
    };
    next = sandbox.stub();
    sandbox
      .stub(userServices, "loginUser")
      .resolves({ id: 1, email: "amr@mail.com" });
    sandbox
      .stub(userController, "sanitizeUser")
      .returns({ id: 1, name: "amr" });
    sandbox
      .stub(jwt, "generateTokens")
      .returns({ accessToken: "aaa", refreshToken: "aaa" });
    sandbox.stub(hashIdUtil, "hashIdEncode");
  });
  afterEach(() => {
    sandbox.restore();
  });
  it("should login successfully", async () => {
    await userController.loginUserController(req, res, next);
    sandbox.assert.calledOnce(userServices.loginUser);
    sandbox.assert.calledOnce(jwt.generateTokens);
    sandbox.assert.calledOnce(userController.sanitizeUser);
    sandbox.assert.calledOnce(res.cookie);
    sandbox.assert.calledWith(res.status, 200);
    sandbox.assert.calledWith(
      res.json,
      sandbox.match({ accessToken: "aaa", user: { id: 1, name: "amr" } })
    );
  });
  it("should rollback if rep createUser throws", async () => {
    userServices.loginUser.callsFake(() => {
      throw new AppError("DB error");
    });
    await userController.loginUserController(req, res, next);
    sandbox.assert.calledOnce(next);
  });
});
