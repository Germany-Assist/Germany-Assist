import sinon from "sinon";
import serviceProviderController from "../../controllers/serviceProvider.controller.js";
import serviceProviderServices from "../../services/serviceProvider.services.js";
import userServices from "../../services/user.services.js";
import permissionServices from "../../services/permission.services.js";
import jwt from "../../middlewares/jwt.middleware.js";
import { sequelize } from "../../database/connection.js";
import { afterEach, before, beforeEach, describe, it } from "node:test";
import authUtil from "../../utils/authorize.util.js";
import { AppError } from "../../utils/error.class.js";
import userController from "../../controllers/user.controller.js";
describe("Create Service Provider Controller Unit Tests", () => {
  let req, res, next;
  beforeEach(() => {
    req = { body: { email: "test@biz.com", password: "123456" } };
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub().returnsThis(),
      cookie: sinon.stub().returnsThis(),
    };
    next = sinon.stub();
  });
  afterEach(() => sinon.restore());

  it("should create a service provider successfully", async () => {
    const fakeTransaction = {
      commit: sinon.stub(),
      rollback: sinon.stub(),
    };
    sinon.stub(userController, "createRootAccount").resolves({
      sanitizedUser: { name: "amr" },
      accessToken: "string",
      refreshToken: "string",
    });
    sinon.stub(sequelize, "transaction").resolves(fakeTransaction);
    sinon
      .stub(serviceProviderServices, "createServiceProvider")
      .resolves({ id: 1, name: "Biz" });
    sinon
      .stub(userServices, "createUser")
      .resolves({ id: 1, firstName: "serviceProvider" });
    sinon.stub(permissionServices, "initPermissions").resolves(true);
    sinon
      .stub(jwt, "generateTokens")
      .returns({ accessToken: "a", refreshToken: "r" });

    const resp = await serviceProviderController.createServiceProvider(
      req,
      res,
      next
    );
    sinon.assert.calledOnce(serviceProviderServices.createServiceProvider);
    sinon.assert.calledWith(res.status, 201);
    sinon.assert.calledOnce(res.json);
    sinon.assert.calledOnce(res.cookie);
    sinon.assert.calledOnce(fakeTransaction.commit);
  });
  it("should rollback on error", async () => {
    const fakeTransaction = { commit: sinon.stub(), rollback: sinon.stub() };
    sinon.stub(sequelize, "transaction").resolves(fakeTransaction);
    sinon
      .stub(serviceProviderServices, "createServiceProvider")
      .throws(new AppError());
    await serviceProviderController.createServiceProvider(req, res, next);
    sinon.assert.calledOnce(fakeTransaction.rollback);
    sinon.assert.calledOnce(next);
  });
});

describe("Update service provider Controller Unit Tests", () => {
  let req, res, next;
  beforeEach(() => {
    req = {
      auth: {
        user: {
          id: 1,
          service_provider_id: "8cd39bc7-5c7c-4ca9-8047-2d54b5250324",
          role: "root_serviceProvider",
        },
      },
      body: { id: 2 },
    };
    res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
    next = sinon.stub();
  });
  afterEach(() => sinon.restore());
  it("should update service provider successfully", async () => {
    sinon.stub(authUtil, "checkRoleAndPermission").resolves(true);
    sinon.stub(authUtil, "checkOwnership").resolves(true);
    sinon
      .stub(serviceProviderServices, "updateServiceProvider")
      .resolves({ newBody: "newBody" });
    await serviceProviderController.updateServiceProvider(req, res, next);
    sinon.assert.calledOnce(authUtil.checkOwnership);
    sinon.assert.calledOnce(authUtil.checkRoleAndPermission);
    sinon.assert.calledOnce(serviceProviderServices.updateServiceProvider);
    sinon.assert.calledWith(res.status, 200);
    sinon.assert.calledWith(res.json, { newBody: "newBody" });
  });
  it("should call next with error if service throws", async () => {
    sinon
      .stub(serviceProviderServices, "updateServiceProvider")
      .throws(new AppError());
    await serviceProviderController.updateServiceProvider(req, res, next);
    sinon.assert.calledOnce(next);
  });
});
describe("Restore service provider Controller Unit Tests", () => {
  let req, res, next;
  beforeEach(() => {
    req = {
      auth: {
        user: {
          id: 1,
          service_provider_id: "8cd39bc7-5c7c-4ca9-8047-2d54b5250324",
          role: "root_serviceProvider",
        },
      },
      body: { id: "8cd39bc7-5c7c-4ca9-8047-2d54b5250324" },
    };
    res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
    next = sinon.stub();
  });
  afterEach(() => sinon.restore());

  it("Should Restore service provider successfully", async () => {
    sinon.stub(authUtil, "checkRoleAndPermission").resolves(true);
    sinon
      .stub(serviceProviderServices, "restoreServiceProvider")
      .resolves({ newBody: "newBody" });

    await serviceProviderController.restoreServiceProvider(req, res, next);
    sinon.assert.calledOnce(authUtil.checkRoleAndPermission);
    sinon.assert.calledOnce(serviceProviderServices.restoreServiceProvider);
    sinon.assert.calledWith(res.status, 200);
    sinon.assert.calledWith(res.json, { newBody: "newBody" });
  });
  it("Should call next with error if service throws", async () => {
    sinon
      .stub(serviceProviderServices, "restoreServiceProvider")
      .throws(new AppError());
    await serviceProviderController.restoreServiceProvider(req, res, next);
    sinon.assert.calledOnce(next);
  });
});
describe("GetAll service provider Controller Unit Test", () => {
  let req, res, next;
  beforeEach(() => {
    req = {};
    res = {
      json: sinon.stub(),
      status: sinon.stub().returnsThis(),
    };
    next = sinon.stub();
  });
  afterEach(() => {
    sinon.restore();
  });
  it("Should get all service provider successfully", async () => {
    sinon
      .stub(serviceProviderServices, "getAllServiceProvider")
      .resolves([{ id: 1 }, { id: 2 }]);
    const resp = await serviceProviderController.getAllServiceProvider(
      req,
      res,
      next
    );
    sinon.assert.calledOnce(serviceProviderServices.getAllServiceProvider);
    sinon.assert.calledWith(res.status, 200);
    sinon.assert.calledWith(res.json, [{ id: 1 }, { id: 2 }]);
  });
  it("Should call next on Error", async () => {
    sinon
      .stub(serviceProviderServices, "getAllServiceProvider")
      .throws(new AppError());
    await serviceProviderController.getAllServiceProvider(req, res, next);
    sinon.assert.calledOnce(next);
  });
});
describe("GetById service provider Controller Unit Test", () => {
  let req, res, next;
  beforeEach(() => {
    req = { params: { id: 1 } };
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };
    next = sinon.stub();
  });
  afterEach(() => {
    sinon.restore();
  });
  it("Should GetById service provider successfully", async () => {
    sinon
      .stub(serviceProviderServices, "getServiceProviderById")
      .resolves({ id: 1 });
    await serviceProviderController.getServiceProviderById(req, res, next);
    sinon.assert.calledOnce(serviceProviderServices.getServiceProviderById);
    sinon.assert.calledWith(res.status, 200);
    sinon.assert.calledWith(res.json, { id: 1 });
  });
});
