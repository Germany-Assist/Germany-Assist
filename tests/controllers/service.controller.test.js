import test, { describe } from "node:test";
import assert from "node:assert/strict";
import sinon from "sinon";
import serviceController from "../../src/modules/service/service.controller.js";
import serviceServices from "../../src/modules/service/service.services.js";
import hashIdUtil from "../../src/utils/hashId.util.js";
import authUtils from "../../src/utils/authorize.util.js";
import { sequelize } from "../../src/configs/database.js";
import { AppError } from "../../src/utils/error.class.js";

describe("Testing Services Controller", () => {
  test("createService → success", async (t) => {
    const sandbox = sinon.createSandbox();

    const fakeTransaction = {
      commit: sandbox.stub().resolves(),
      rollback: sandbox.stub().resolves(),
    };
    sandbox.stub(sequelize, "transaction").resolves(fakeTransaction);
    sandbox.stub(authUtils, "checkRoleAndPermission").resolves();
    sandbox.stub(serviceServices, "createService").resolves({
      id: 1,
      title: "test service",
      UserId: 2,
      categoryId: 3,
      Timelines: [{ id: 10, label: "t1", isArchived: false }],
    });
    sandbox.stub(hashIdUtil, "hashIdEncode").callsFake((id) => `encoded-${id}`);

    const req = {
      auth: { id: 1, role: "service_provider_root", related_id: 2 },
      body: {
        title: "Test",
        description: "Desc",
        price: 10,
        publish: true,
        category: "cat",
        timelineLabel: "timeline",
      },
    };
    const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
    const next = sinon.stub();

    await serviceController.createService(req, res, next);

    assert.equal(serviceServices.createService.calledOnce, true);
    assert.equal(fakeTransaction.commit.calledOnce, true);
    assert.equal(res.status.calledWith(201), true);
    assert.equal(res.json.calledOnce, true);
    assert.equal(next.called, false);

    sandbox.restore();
  });

  test("createService → failure should rollback", async (t) => {
    const sandbox = sinon.createSandbox();

    const fakeTransaction = {
      commit: sandbox.stub(),
      rollback: sandbox.stub().resolves(),
    };
    sandbox.stub(sequelize, "transaction").resolves(fakeTransaction);
    sandbox
      .stub(authUtils, "checkRoleAndPermission")
      .rejects(new AppError(403, "Forbidden"));

    const req = { auth: {}, body: {} };
    const res = {};
    const next = sinon.stub();

    await serviceController.createService(req, res, next);

    assert.equal(fakeTransaction.rollback.calledOnce, true);
    assert.equal(next.calledOnce, true);

    sandbox.restore();
  });

  test("getAllServices → success", async (t) => {
    const sandbox = sinon.createSandbox();

    sandbox.stub(serviceServices, "getAllServices").resolves({
      data: [{ id: 1, "Category.title": "cat", "ServiceProvider.name": "sp" }],
    });
    sandbox.stub(hashIdUtil, "hashIdEncode").callsFake((id) => `encoded-${id}`);

    const req = { query: {} };
    const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
    const next = sinon.stub();

    await serviceController.getAllServices(req, res, next);

    assert.equal(serviceServices.getAllServices.calledOnce, true);
    assert.equal(res.status.calledWith(200), true);
    assert.equal(res.json.calledOnce, true);
    assert.equal(next.called, false);

    sandbox.restore();
  });

  test("getServiceProfile → success", async (t) => {
    const sandbox = sinon.createSandbox();

    sandbox.stub(hashIdUtil, "hashIdDecode").returns(1);
    sandbox.stub(hashIdUtil, "hashIdEncode").callsFake((id) => `encoded-${id}`);
    sandbox.stub(serviceServices, "getServiceByIdPublic").resolves({
      id: 1,
      Category: { title: "cat" },
      Timelines: [{ id: 2, label: "timeline" }],
      Reviews: [
        {
          body: "good",
          rating: 5,
          User: { firstName: "John", lastName: "Doe", id: 9 },
        },
      ],
    });

    const req = { params: { id: "encoded-1" } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
    const next = sinon.stub();

    await serviceController.getServiceProfile(req, res, next);

    assert.equal(serviceServices.getServiceByIdPublic.calledOnce, true);
    assert.equal(res.status.calledWith(200), true);
    assert.equal(res.json.calledOnce, true);
    assert.equal(next.called, false);

    sandbox.restore();
  });

  test("alterServiceStatusSP → success", async (t) => {
    const sandbox = sinon.createSandbox();

    sandbox.stub(authUtils, "checkRoleAndPermission").resolves();
    sandbox.stub(hashIdUtil, "hashIdDecode").returns(1);
    sandbox.stub(serviceServices, "alterServiceStatusSP").resolves();

    const req = { auth: {}, body: { id: "encoded-1", status: "publish" } };
    const res = { sendStatus: sinon.stub() };
    const next = sinon.stub();

    await serviceController.alterServiceStatusSP(req, res, next);

    assert.equal(serviceServices.alterServiceStatusSP.calledOnce, true);
    assert.equal(res.sendStatus.calledWith(200), true);
    assert.equal(next.called, false);

    sandbox.restore();
  });

  test("alterServiceStatusSP → invalid status throws AppError", async (t) => {
    const sandbox = sinon.createSandbox();

    const next = sinon.stub();
    const req = { auth: {}, body: { id: "1", status: "wrong-status" } };
    const res = {};

    await serviceController.alterServiceStatusSP(req, res, next);

    assert.equal(next.calledOnce, true);
    assert(next.firstCall.args[0] instanceof AppError);

    sandbox.restore();
  });

  test("deleteService → success", async (t) => {
    const sandbox = sinon.createSandbox();

    sandbox.stub(authUtils, "checkRoleAndPermission").resolves();
    sandbox.stub(authUtils, "checkOwnership").resolves();
    sandbox.stub(hashIdUtil, "hashIdDecode").returns(1);
    sandbox.stub(serviceServices, "deleteService").resolves();

    const req = { auth: {}, params: { id: "encoded-1" } };
    const res = { send: sinon.stub() };
    const next = sinon.stub();

    await serviceController.deleteService(req, res, next);

    assert.equal(serviceServices.deleteService.calledOnce, true);
    assert.equal(res.send.calledOnce, true);
    assert.equal(next.called, false);

    sandbox.restore();
  });
});
