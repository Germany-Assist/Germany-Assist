// service.controller.test.js
import test, { it } from "node:test";
import assert from "node:assert";
import sinon from "sinon";

import serviceController from "../../controllers/service.controller.js";
import serviceServices from "../../services/service.services.js";
import hashIdUtil from "../../utils/hashId.util.js";
import authUtils from "../../utils/authorize.util.js";
import { sequelize } from "../../database/connection.js";
import { AppError } from "../../utils/error.class.js";

function createMockRes() {
  return {
    status: sinon.stub().returnsThis(),
    json: sinon.stub().returnsThis(),
    sendStatus: sinon.stub().returnsThis(),
  };
}

test.describe("Service Controller", () => {
  let res, next;

  test.beforeEach(() => {
    res = createMockRes();
    next = sinon.stub();
  });

  test.afterEach(() => {
    sinon.restore();
  });

  test("createService - success", async () => {
    const req = {
      auth: { id: 1, related_id: 2, role: "service_provider_root" },
      body: {
        title: "Test",
        description: "desc",
        type: "type",
        price: 100,
        publish: true,
      },
    };

    const fakeTransaction = { commit: sinon.stub(), rollback: sinon.stub() };
    sinon.stub(sequelize, "transaction").resolves(fakeTransaction);
    sinon.stub(authUtils, "checkRoleAndPermission").resolves(true);
    sinon
      .stub(serviceServices, "createService")
      .resolves({ id: 123, UserId: 1 });
    sinon.stub(hashIdUtil, "hashIdEncode").callsFake((id) => `encoded-${id}`);

    await serviceController.createService(req, res, next);

    assert(res.status.calledWith(201));
    assert(
      res.json.calledWithMatch({ id: "encoded-123", user_id: "encoded-1" })
    );
    assert(fakeTransaction.commit.calledOnce);
  });

  test("createService - error → rollback", async () => {
    const req = { auth: { id: 1 }, body: {} };

    const fakeTransaction = { commit: sinon.stub(), rollback: sinon.stub() };
    sinon.stub(sequelize, "transaction").resolves(fakeTransaction);
    sinon
      .stub(authUtils, "checkRoleAndPermission")
      .throws(new Error("Auth error"));

    await serviceController.createService(req, res, next);

    assert(fakeTransaction.rollback.calledOnce);
    assert(next.calledOnce);
  });

  test("getAllServices - success", async () => {
    const fakeService = {
      get: () => ({
        id: 1,
        categories: [{ title: "cat" }],
        User: { fullName: "John", email: "john@test.com" },
        user_id: 11,
      }),
    };

    sinon.stub(serviceServices, "getAllServices").resolves([fakeService]);
    sinon.stub(hashIdUtil, "hashIdEncode").callsFake((id) => `encoded-${id}`);

    await serviceController.getAllServices({}, res, next);

    assert(res.status.calledWith(200));
    assert(res.json.calledOnce);
    const payload = res.json.firstCall.args[0];
    assert.equal(payload[0].categories[0], "cat");
    assert.equal(payload[0].creator.user_id, "encoded-11");
  });

  test("getAllServicesAdmin - requires admin", async () => {
    sinon.stub(authUtils, "checkRoleAndPermission").resolves(true);
    sinon.stub(serviceServices, "getAllServicesAdmin").resolves([]);

    await serviceController.getAllServicesAdmin({ auth: {} }, res, next);

    assert(res.status.calledWith(200));
    assert(res.json.calledWith([]));
  });

  test("getAllServicesServiceProvider - requires provider role", async () => {
    sinon.stub(authUtils, "checkRoleAndPermission").resolves(true);
    sinon.stub(serviceServices, "getAllServicesServiceProvider").resolves([]);

    await serviceController.getAllServicesServiceProvider(
      { auth: { related_id: 5 } },
      res,
      next
    );

    assert(res.status.calledWith(200));
  });

  test("getServiceId - returns sanitized service", async () => {
    const fakeService = {
      get: () => ({
        id: 7,
        categories: [],
        User: { fullName: "A", email: "B" },
        user_id: 1,
      }),
    };

    sinon.stub(serviceServices, "getServiceById").resolves(fakeService);
    sinon.stub(hashIdUtil, "hashIdDecode").returns(7);
    sinon.stub(hashIdUtil, "hashIdEncode").callsFake((id) => `encoded-${id}`);

    await serviceController.getServiceId({ params: { id: "enc7" } }, res, next);

    assert(res.status.calledWith(200));
    assert(res.json.calledOnce);
  });

  test("getServicesByServiceProviderId - success", async () => {
    const fakeService = {
      get: () => ({ id: 8, categories: [], User: null, user_id: 2 }),
    };
    sinon
      .stub(serviceServices, "getServicesByServiceProviderId")
      .resolves([fakeService]);
    sinon.stub(hashIdUtil, "hashIdEncode").returns("encoded");

    await serviceController.getServicesByServiceProviderId(
      { params: { id: 1 } },
      res,
      next
    );

    assert(res.status.calledWith(200));
  });

  test("getByCategories - success", async () => {
    const fakeService = {
      get: () => ({ id: 9, categories: [], User: null, user_id: 3 }),
    };
    sinon.stub(serviceServices, "getServicesByType").resolves([fakeService]);
    sinon.stub(hashIdUtil, "hashIdEncode").returns("encoded");

    await serviceController.getByCategories(
      { body: { categories: ["A"] } },
      res,
      next
    );

    assert(res.status.calledWith(200));
  });

  test("updateService - updates allowed fields only", async () => {
    const req = {
      auth: { role: "service_provider_root", related_id: 5 },
      body: { id: "encoded5", title: "new", description: "desc", extra: "no" },
    };

    sinon.stub(authUtils, "checkRoleAndPermission").resolves(true);
    sinon.stub(authUtils, "checkOwnership").resolves(true);
    sinon.stub(hashIdUtil, "hashIdDecode").returns(5);
    sinon.stub(serviceServices, "updateService").resolves();

    await serviceController.updateService(req, res, next);

    assert(
      serviceServices.updateService.calledWith(5, {
        title: "new",
        description: "desc",
      })
    );
    assert(res.sendStatus.calledWith(200));
  });

  test("deleteService - success", async () => {
    const req = {
      auth: { role: "admin", related_id: 2 },
      params: { id: "enc2" },
    };

    sinon.stub(authUtils, "checkRoleAndPermission").resolves(true);
    sinon.stub(authUtils, "checkOwnership").resolves(true);
    sinon.stub(hashIdUtil, "hashIdDecode").returns(2);
    sinon.stub(serviceServices, "deleteService").resolves();

    await serviceController.deleteService(req, res, next);

    assert(res.sendStatus.calledWith(200));
  });

  test("restoreService - success", async () => {
    const req = { auth: { role: "admin" }, params: { id: "enc3" } };

    sinon.stub(authUtils, "checkRoleAndPermission").resolves(true);
    sinon.stub(hashIdUtil, "hashIdDecode").returns(3);
    sinon.stub(serviceServices, "restoreService").resolves();

    await serviceController.restoreService(req, res, next);

    assert(res.sendStatus.calledWith(200));
  });

  test("alterServiceStatus - success", async () => {
    const req = {
      auth: { role: "admin" },
      body: { id: "enc4", status: "active" },
    };

    sinon.stub(authUtils, "checkRoleAndPermission").resolves(true);
    sinon.stub(hashIdUtil, "hashIdDecode").returns(4);
    sinon.stub(serviceServices, "alterServiceStatus").resolves();
    await serviceController.alterServiceStatus(req, res, next);
    assert(res.sendStatus.calledWith(200));
  });

  test("alterServiceStatusSP - invalid status calls next with AppError", async () => {
    const req = { body: { status: "wrong", id: "enc5" }, auth: {} };
    const res = createMockRes();
    const next = sinon.stub();
    await serviceController.alterServiceStatusSP(req, res, next);
    assert(next.calledOnce);
    const err = next.firstCall.args[0];
    assert(err instanceof AppError);
    assert.equal(err.message, "invalid status");
  });

  test("alterServiceStatusSP - valid status", async () => {
    const req = {
      body: { status: "publish", id: "enc5" },
      auth: { role: "service_provider_root" },
    };
    sinon.stub(authUtils, "checkRoleAndPermission").resolves(true);
    sinon.stub(hashIdUtil, "hashIdDecode").returns(5);
    sinon.stub(serviceServices, "alterServiceStatusSP").resolves();
    await serviceController.alterServiceStatusSP(req, res, next);
    assert(res.sendStatus.calledWith(200));
  });
});
