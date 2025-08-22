import sinon from "sinon";
import * as businessController from "../../controllers/business.controller.js";
import businessServices from "../../services/business.services.js";
import userServices from "../../services/user.services.js";
import permissionServices from "../../services/permission.services.js";
import jwt from "../../middlewares/jwt.middleware.js";
import { sequelize } from "../../database/connection.js";
import { afterEach, before, beforeEach, describe, it } from "node:test";
import authUtils from "../../utils/authorize.requests.util.js";
import { AppError } from "../../utils/error.class.js";
import assert from "node:assert";
describe("Create Business Controller Unit Tests", () => {
  let req, res, next;
  beforeEach(() => {
    req = { body: { email: "test@biz.com", password: "123456" } };
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
      cookie: sinon.stub(),
    };
    next = sinon.stub();
  });
  afterEach(() => sinon.restore());

  it("should create a business successfully", async () => {
    const fakeTransaction = { commit: sinon.stub(), rollback: sinon.stub() };
    sinon.stub(sequelize, "transaction").resolves(fakeTransaction);
    sinon
      .stub(businessServices, "createBusiness")
      .resolves({ id: 1, name: "Biz" });
    sinon
      .stub(userServices, "createUser")
      .resolves({ id: 1, firstName: "business" });
    sinon.stub(permissionServices, "initPermissions").resolves(true);
    sinon
      .stub(jwt, "generateTokens")
      .returns({ accessToken: "a", refreshToken: "r" });

    await businessController.createBusiness(req, res, next);
    sinon.assert.calledOnce(businessServices.createBusiness);
    sinon.assert.calledWith(res.status, 201);
    sinon.assert.calledOnce(res.json);
    sinon.assert.calledOnce(res.cookie);
    sinon.assert.calledOnce(fakeTransaction.commit);
  });
  it("should rollback on error", async () => {
    const fakeTransaction = { commit: sinon.stub(), rollback: sinon.stub() };
    sinon.stub(sequelize, "transaction").resolves(fakeTransaction);
    sinon.stub(businessServices, "createBusiness").throws(new AppError());
    await businessController.createBusiness(req, res, next);
    sinon.assert.calledOnce(fakeTransaction.rollback);
    sinon.assert.calledOnce(next);
  });
});
describe("Delete Business Controller Unit Tests", () => {
  let req, res, next;
  beforeEach(() => {
    req = {
      auth: {
        user: {
          id: 1,
          businessId: "8cd39bc7-5c7c-4ca9-8047-2d54b5250324",
          role: "root_business",
        },
      },
      body: { id: 2 },
    };
    res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
    next = sinon.stub();
  });
  afterEach(() => sinon.restore());
  it("should delete business successfully", async () => {
    sinon.stub(businessServices, "deleteBusiness").resolves(true);
    sinon.stub(authUtils, "checkRoleAndPermission").resolves(true);
    sinon.stub(authUtils, "checkOwnership").resolves(true);
    await businessController.deleteBusiness(req, res, next);
    sinon.assert.calledOnce(businessServices.deleteBusiness);
    sinon.assert.calledOnce(authUtils.checkRoleAndPermission);
    sinon.assert.calledOnce(authUtils.checkOwnership);
    sinon.assert.calledWith(res.status, 200);
    sinon.assert.calledOnce(res.json);
  });
  it("should call next with error if service throws", async () => {
    sinon.stub(businessServices, "deleteBusiness").throws(new Error("fail"));
    await businessController.deleteBusiness(req, res, next);
    sinon.assert.calledOnce(next);
  });
});
describe("Update Business Controller Unit Tests", () => {
  let req, res, next;
  beforeEach(() => {
    req = {
      auth: {
        user: {
          id: 1,
          businessId: "8cd39bc7-5c7c-4ca9-8047-2d54b5250324",
          role: "root_business",
        },
      },
      body: { id: 2 },
    };
    res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
    next = sinon.stub();
  });
  afterEach(() => sinon.restore());
  it("should update business successfully", async () => {
    sinon.stub(authUtils, "checkRoleAndPermission").resolves(true);
    sinon.stub(authUtils, "checkOwnership").resolves(true);
    sinon
      .stub(businessServices, "updateBusiness")
      .resolves({ newBody: "newBody" });
    await businessController.updateBusiness(req, res, next);
    sinon.assert.calledOnce(authUtils.checkOwnership);
    sinon.assert.calledOnce(authUtils.checkRoleAndPermission);
    sinon.assert.calledOnce(businessServices.updateBusiness);
    sinon.assert.calledWith(res.status, 200);
    sinon.assert.calledWith(res.json, { newBody: "newBody" });
  });
  it("should call next with error if service throws", async () => {
    sinon.stub(businessServices, "updateBusiness").throws(new AppError());
    await businessController.updateBusiness(req, res, next);
    sinon.assert.calledOnce(next);
  });
});
describe("Restore Business Controller Unit Tests", () => {
  let req, res, next;
  beforeEach(() => {
    req = {
      auth: {
        user: {
          id: 1,
          businessId: "8cd39bc7-5c7c-4ca9-8047-2d54b5250324",
          role: "root_business",
        },
      },
      body: { id: "8cd39bc7-5c7c-4ca9-8047-2d54b5250324" },
    };
    res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
    next = sinon.stub();
  });
  afterEach(() => sinon.restore());

  it("Should Restore business successfully", async () => {
    sinon.stub(authUtils, "checkRoleAndPermission").resolves(true);
    sinon
      .stub(businessServices, "restoreBusiness")
      .resolves({ newBody: "newBody" });

    await businessController.restoreBusiness(req, res, next);
    sinon.assert.calledOnce(authUtils.checkRoleAndPermission);
    sinon.assert.calledOnce(businessServices.restoreBusiness);
    sinon.assert.calledWith(res.status, 200);
    sinon.assert.calledWith(res.json, { newBody: "newBody" });
  });
  it("Should call next with error if service throws", async () => {
    sinon.stub(businessServices, "restoreBusiness").throws(new AppError());
    await businessController.restoreBusiness(req, res, next);
    sinon.assert.calledOnce(next);
  });
});
describe("GetAll Business Controller Unit Test", () => {
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
  it("Should get all business successfully", async () => {
    sinon
      .stub(businessServices, "getAllBusiness")
      .resolves([{ id: 1 }, { id: 2 }]);
    const resp = await businessController.getAllBusiness(req, res, next);
    sinon.assert.calledOnce(businessServices.getAllBusiness);
    sinon.assert.calledWith(res.status, 200);
    sinon.assert.calledWith(res.json, [{ id: 1 }, { id: 2 }]);
  });
  it("Should call next on Error", async () => {
    sinon.stub(businessServices, "getAllBusiness").throws(new AppError());
    await businessController.getAllBusiness(req, res, next);
    sinon.assert.calledOnce(next);
  });
});
describe("GetById Business Controller Unit Test", () => {
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
  it("Should GetById Business successfully", async () => {
    sinon.stub(businessServices, "getBusinessById").resolves({ id: 1 });
    await businessController.getBusinessById(req, res, next);
    sinon.assert.calledOnce(businessServices.getBusinessById);
    sinon.assert.calledWith(res.status, 200);
    sinon.assert.calledWith(res.json, { id: 1 });
  });
  it("Should call next on Error", async () => {});
});
