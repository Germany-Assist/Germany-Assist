import userController, {
  cookieOptions,
} from "../../controllers/user.controller.js";
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
import assert from "node:assert";
let fakeUser = {
  firstName: "testing",
  lastName: "testing",
  email: "test@test.com",
  dob: "1987/6/5",
  password: "test@Pass",
  image: "image@image.png",
};
describe("Testing Create User Controller", () => {
  let sandbox,
    req,
    res,
    next,
    fakeTransaction,
    randomId,
    setRoleAndTypeRepSpy,
    hashPasswordSpy;
  randomId = 1;
  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = {
      body: fakeUser,
      auth: {
        id: randomId,
        role: undefined,
        related_type: null,
        related_id: null,
      },
    };
    next = sandbox.stub();
    res = {
      status: sandbox.stub().returnsThis(),
      json: sandbox.stub().returnsThis(),
      cookie: sandbox.stub().returnsThis(),
    };
    fakeTransaction = { commit: sandbox.stub(), rollback: sandbox.stub() };
    sandbox.stub(authUtil, "checkRoleAndPermission").resolves(true);
    sandbox
      .stub(userServices, "createUser")
      .resolves({ id: randomId, firstName: "testing" });
    sandbox.stub(permissionServices, "initPermissions").resolves(true);
    sandbox
      .stub(jwt, "generateTokens")
      .returns({ accessToken: "aaa", refreshToken: "bbb" });
    sandbox
      .stub(userController, "sanitizeUser")
      .returns({ id: 1, name: "amr" });
    sandbox.stub(hashIdUtil, "hashIdEncode").returns(randomId);
    sandbox.stub(sequelize, "transaction").resolves(fakeTransaction);
    hashPasswordSpy = sandbox.spy(bcryptUtil, "hashPassword");
    setRoleAndTypeRepSpy = sandbox.spy(userController, "setRoleAndTypeRep");
  });

  afterEach(() => sandbox.restore());

  it("should create a client successfully", async () => {
    req.auth = undefined;
    await userController.createClientController(req, res, next);
    sandbox.assert.calledWith(hashPasswordSpy, fakeUser.password);
    sandbox.assert.calledWith(
      userServices.createUser,
      sandbox.match({
        first_name: fakeUser.firstName,
        last_name: fakeUser.lastName,
        email: fakeUser.email,
        password: hashPasswordSpy.returnValues[0],
        UserRole: {
          role: "client",
          related_type: "client",
          related_id: null,
        },
      }),
      fakeTransaction
    );
    sandbox.assert.calledWithMatch(
      permissionServices.initPermissions,
      sandbox.match.any,
      sandbox.match.array.deepEquals(roleTemplates.client),
      sandbox.match(fakeTransaction)
    );
    sandbox.assert.calledOnce(userController.sanitizeUser);
    sandbox.assert.calledOnce(jwt.generateTokens);
    sandbox.assert.calledWithMatch(
      res.cookie,
      "refreshToken",
      sinon.match.any,
      cookieOptions
    );
    sandbox.assert.calledWith(res.status, 201);
    sandbox.assert.calledOnce(fakeTransaction.commit);
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
    sandbox.assert.calledWith(hashPasswordSpy, fakeUser.password);
    sandbox.assert.calledWith(
      userServices.createUser,
      sandbox.match({
        first_name: fakeUser.firstName,
        last_name: fakeUser.lastName,
        email: fakeUser.email,
        password: hashPasswordSpy.returnValues[0],
        UserRole: {
          role: "admin",
          related_type: "admin",
          related_id: null,
        },
      }),
      fakeTransaction
    );
    sandbox.assert.calledWithMatch(
      permissionServices.initPermissions,
      sandbox.match.any,
      sandbox.match.array.deepEquals(roleTemplates.admin),
      sandbox.match(fakeTransaction)
    );
    sandbox.assert.calledOnce(userController.sanitizeUser);
    sandbox.assert.calledOnce(jwt.generateTokens);
    sandbox.assert.calledWithMatch(
      res.cookie,
      "refreshToken",
      sinon.match.any,
      cookieOptions
    );
    sandbox.assert.calledWith(res.status, 201);
    sandbox.assert.calledOnce(fakeTransaction.commit);
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
    //just adjusting the token
    req.auth.role = "service_provider_root";
    req.auth.related_type = "ServiceProvider";
    req.auth.related_id = "ABC";
    await userController.createRepController(req, res, next);
    sandbox.assert.calledWith(hashPasswordSpy, fakeUser.password);
    sandbox.assert.calledWith(setRoleAndTypeRepSpy, req.auth.role);
    assert.deepStrictEqual(setRoleAndTypeRepSpy.returnValues[0], {
      role: "service_provider_rep",
      related_type: "ServiceProvider",
    });
    sandbox.assert.calledWith(
      userServices.createUser,
      sandbox.match({
        first_name: fakeUser.firstName,
        last_name: fakeUser.lastName,
        email: fakeUser.email,
        password: hashPasswordSpy.returnValues[0],
        UserRole: {
          role: setRoleAndTypeRepSpy.returnValues[0].role,
          related_type: setRoleAndTypeRepSpy.returnValues[0].related_type,
          related_id: req.auth.related_id,
        },
      }),
      fakeTransaction
    );
    sandbox.assert.calledWithMatch(
      permissionServices.initPermissions,
      sandbox.match.number,
      sandbox.match.array.deepEquals(roleTemplates.service_provider_rep),
      sandbox.match(fakeTransaction)
    );
    sandbox.assert.calledWithMatch(
      res.cookie,
      "refreshToken",
      sinon.match.any,
      cookieOptions
    );
    sandbox.assert.calledWith(res.status, 201);
    sandbox.assert.calledOnce(fakeTransaction.commit);
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
  it("should create new root account Service Provider", async () => {
    //please note that the create root account is not a route handler
    //its a controller part of create serviceProvider or employer
    let email, password, relatedId, type;
    password = fakeUser.password;
    type = "serviceProvider";
    let setRoleAndTypeSpy = sandbox.spy(userController, "setRoleAndType");
    await userController.createRootAccount(
      email,
      password,
      relatedId,
      type,
      fakeTransaction
    );
    sandbox.assert.calledWith(setRoleAndTypeSpy, "serviceProvider");
    sandbox.assert.calledWithMatch(
      permissionServices.initPermissions,
      sandbox.match.number,
      sandbox.match.array.deepEquals(roleTemplates.service_provider_root),
      sandbox.match(fakeTransaction)
    );
    sandbox.assert.calledWith(hashPasswordSpy, password);
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
  it("should call next if error", async () => {
    userServices.loginUser.callsFake(() => {
      throw new AppError("DB error");
    });
    await userController.loginUserController(req, res, next);
    sandbox.assert.calledOnce(next);
  });
});
describe("Testing Helpers For the User controllers", () => {
  let sandbox = sinon.createSandbox();
  before(() => {
    const hashId = sandbox.stub(hashIdUtil, "hashIdEncode");
  });
  after(() => {
    sandbox.restore();
  });
  it("should test Sanitize User", () => {
    const input = {
      id: 123,
      first_name: "John",
      last_name: "Doe",
      dob: "1990-01-01",
      email: "john@example.com",
      image: "profile.png",
      is_verified: false,
      UserRole: {
        role: "admin",
        related_type: "admin",
        related_id: null,
      },
    };
    const sanitizedUser = userController.sanitizeUser(input);
    assert.deepStrictEqual(sanitizedUser, {
      id: hashIdUtil.hashIdEncode(123),
      firstName: "John",
      lastName: "Doe",
      dob: "1990-01-01",
      email: "john@example.com",
      image: "profile.png",
      isVerified: false,
      role: "admin",
      related_type: "admin",
      related_id: null,
    });
  });

  it("maps service_provider_root for rep correctly", () => {
    const result = userController.setRoleAndTypeRep("service_provider_root");
    assert.deepStrictEqual(result, {
      role: "service_provider_rep",
      related_type: "ServiceProvider",
    });
  });

  it("maps employer_root for rep correctly", () => {
    const result = userController.setRoleAndTypeRep("employer_root");
    assert.deepStrictEqual(result, {
      role: "employer_rep",
      related_type: "Employer",
    });
  });
  it("returns correct root data for serviceProvider", () => {
    const result = userController.setRoleAndType("serviceProvider");
    assert.deepStrictEqual(result, {
      rootRole: "service_provider_root",
      rootRelatedType: "ServiceProvider",
      firstName: "root",
      lastName: "serviceProvider",
    });
  });

  it("returns correct root data for employer", () => {
    const result = userController.setRoleAndType("employer");
    assert.deepStrictEqual(result, {
      rootRole: "employer_root",
      rootRelatedType: "Employer",
      firstName: "root",
      lastName: "employer",
    });
  });
});
