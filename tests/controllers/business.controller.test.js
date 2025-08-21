import sinon from "sinon";
import { createBusiness } from "../../controllers/business.controller.js";
import businessServices from "../../services/business.services.js";
import userServices from "../../services/user.services.js";
import permissionServices from "../../services/permission.services.js";
import jwt from "../../middlewares/jwt.middleware.js";
import { sequelize } from "../../database/connection.js";
import { afterEach, beforeEach, describe, it } from "node:test";

describe("Business Controller Unit Tests", () => {
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
    sinon.stub(permissionServices, "initPermissions").resolves();
    sinon
      .stub(jwt, "generateTokens")
      .returns({ accessToken: "a", refreshToken: "r" });

    await createBusiness(req, res, next);
    sinon.assert.calledOnce(businessServices.createBusiness);
    sinon.assert.calledWith(res.status, 201);
    sinon.assert.calledOnce(res.json);
    sinon.assert.calledOnce(res.cookie);
    sinon.assert.calledOnce(fakeTransaction.commit);
  });

  it("should rollback on error", async () => {
    const fakeTransaction = { commit: sinon.stub(), rollback: sinon.stub() };
    sinon.stub(sequelize, "transaction").resolves(fakeTransaction);
    sinon.stub(businessServices, "createBusiness").throws(new Error("fail"));
    await createBusiness(req, res, next);
    sinon.assert.calledOnce(fakeTransaction.rollback);
    sinon.assert.calledOnce(next);
  });
});
