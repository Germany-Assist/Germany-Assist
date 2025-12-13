import { test, beforeEach, afterEach, describe } from "node:test";
import assert from "node:assert/strict";
import sinon from "sinon";

import serviceServices from "../../src/modules/service/service.services.js";
import db from "../../src/database/dbIndex.js";
import { AppError } from "../../src/utils/error.class.js";

let sandbox;

beforeEach(() => {
  sandbox = sinon.createSandbox();
});

afterEach(() => {
  sandbox.restore();
});

describe("testing the service services", () => {
  //
  // createService
  //
  test("createService() should create service successfully", async () => {
    sandbox.stub(db.Category, "findOne").resolves({ id: 1 });
    sandbox.stub(db.Service, "create").resolves({
      get: () => ({ id: 10, title: "Test" }),
    });

    const data = { title: "Test", category: "Cat1", service_provider_id: 1 };
    const t = {};
    const result = await serviceServices.createService(data, t);

    assert.deepEqual(result, { id: 10, title: "Test" });
  });

  test("createService() should throw if category not found", async () => {
    sandbox.stub(db.Category, "findOne").resolves(null);

    await assert.rejects(
      serviceServices.createService({ category: "Invalid" }, {}),
      (err) => err instanceof AppError && err.httpCode === 422
    );
  });

  //
  // getAllServices
  //
  test("getAllServices() should return public services with default pagination", async () => {
    const fakeResult = { rows: [{ id: 1 }], count: 1 };
    const stub = sandbox
      .stub(db.Service, "findAndCountAll")
      .resolves(fakeResult);
    const result = await serviceServices.getAllServices({}, "public");
    assert.equal(result.page, 1);
    assert.equal(result.limit, 10);
    assert.deepEqual(result.data, fakeResult.rows);
    assert.ok(stub.calledOnce);
  });

  //
  // getServiceByIdPublic
  //
  test("getServiceByIdPublic() should return service and increment views", async () => {
    const fakeService = {
      increment: sinon.stub(),
      save: sinon.stub().resolves(),
      toJSON: () => ({ id: 1 }),
    };
    sandbox.stub(db.Service, "findOne").resolves(fakeService);

    const result = await serviceServices.getServiceByIdPublic(1);

    assert.deepEqual(result, { id: 1 });
    assert.ok(fakeService.increment.calledOnceWith("views"));
    assert.ok(fakeService.save.calledOnce);
  });

  test("getServiceByIdPublic() should throw if service not found", async () => {
    sandbox.stub(db.Service, "findOne").resolves(null);
    await assert.rejects(
      serviceServices.getServiceByIdPublic(1),
      (err) => err instanceof AppError && err.httpCode === 404
    );
  });

  //
  // getServiceProfileForAdminAndSP
  //
  test("getServiceProfileForAdminAndSP() should return service", async () => {
    const fakeService = { toJSON: () => ({ id: 1 }) };
    sandbox.stub(db.Service, "findOne").resolves(fakeService);

    const result = await serviceServices.getServiceProfileForAdminAndSP(1);
    assert.deepEqual(result, { id: 1 });
  });

  test("getServiceProfileForAdminAndSP() should throw if service not found", async () => {
    sandbox.stub(db.Service, "findOne").resolves(null);
    await assert.rejects(
      serviceServices.getServiceProfileForAdminAndSP(1),
      (err) => err instanceof AppError && err.httpCode === 404
    );
  });

  //
  // getClientServices
  //
  test("getClientServices() should return services", async () => {
    const fakeData = [{ id: 1 }];
    sandbox.stub(db.Service, "findAll").resolves(fakeData);

    const result = await serviceServices.getClientServices(1);
    assert.deepEqual(result, fakeData);
  });

  //
  // updateService
  //
  test("updateService() should update service successfully", async () => {
    const fakeService = { update: sinon.stub().resolves("updated") };
    sandbox.stub(db.Service, "findByPk").resolves(fakeService);

    const result = await serviceServices.updateService(1, { title: "New" });
    assert.equal(result, "updated");
  });

  test("updateService() should throw if service not found", async () => {
    sandbox.stub(db.Service, "findByPk").resolves(null);
    await assert.rejects(
      serviceServices.updateService(1, {}),
      (err) => err instanceof AppError && err.httpCode === 404
    );
  });

  //
  // deleteService
  //
  test("deleteService() should destroy service", async () => {
    const destroyStub = sinon.stub().resolves(true);
    sandbox.stub(db.Service, "findOne").resolves({ destroy: destroyStub });

    const result = await serviceServices.deleteService(1);
    assert.equal(result, true);
  });

  test("deleteService() should throw if service not found", async () => {
    sandbox.stub(db.Service, "findOne").resolves(null);
    await assert.rejects(
      serviceServices.deleteService(1),
      (err) => err instanceof AppError && err.httpCode === 404
    );
  });

  //
  // restoreService
  //
  test("restoreService() should restore deleted service", async () => {
    const fakeService = {
      deletedAt: true,
      restore: sinon.stub().resolves("restored"),
    };
    sandbox.stub(db.Service, "findByPk").resolves(fakeService);

    const result = await serviceServices.restoreService(1);
    assert.equal(result, "restored");
  });

  test("restoreService() should throw if service not deleted", async () => {
    const fakeService = { deletedAt: null };
    sandbox.stub(db.Service, "findByPk").resolves(fakeService);

    await assert.rejects(
      serviceServices.restoreService(1),
      (err) => err instanceof AppError && err.httpCode === 400
    );
  });

  test("restoreService() should throw if service not found", async () => {
    sandbox.stub(db.Service, "findByPk").resolves(null);
    await assert.rejects(
      serviceServices.restoreService(1),
      (err) => err instanceof AppError && err.httpCode === 404
    );
  });

  //
  // alterServiceStatus
  //
  test("alterServiceStatus() should approve service", async () => {
    const fakeService = {
      save: sinon.stub().resolves(),
      approved: false,
      rejected: false,
    };
    sandbox.stub(db.Service, "findByPk").resolves(fakeService);

    await serviceServices.alterServiceStatus(1, "approve");
    assert.equal(fakeService.approved, true);
    assert.equal(fakeService.rejected, false);
  });

  test("alterServiceStatus() should reject service", async () => {
    const fakeService = {
      save: sinon.stub().resolves(),
      approved: true,
      rejected: false,
    };
    sandbox.stub(db.Service, "findByPk").resolves(fakeService);

    await serviceServices.alterServiceStatus(1, "reject");
    assert.equal(fakeService.approved, false);
    assert.equal(fakeService.rejected, true);
  });

  test("alterServiceStatus() should throw on invalid status", async () => {
    sandbox.stub(db.Service, "findByPk").resolves({});
    await assert.rejects(
      serviceServices.alterServiceStatus(1, "invalid"),
      (err) => err instanceof AppError && err.httpCode === 400
    );
  });

  //
  // alterServiceStatusSP
  //
  test("alterServiceStatusSP() should publish service", async () => {
    const fakeService = { save: sinon.stub().resolves(), published: false };
    sandbox.stub(db.Service, "findByPk").resolves(fakeService);

    await serviceServices.alterServiceStatusSP(1, "publish");
    assert.equal(fakeService.published, true);
  });

  test("alterServiceStatusSP() should unpublish service", async () => {
    const fakeService = { save: sinon.stub().resolves(), published: true };
    sandbox.stub(db.Service, "findByPk").resolves(fakeService);

    await serviceServices.alterServiceStatusSP(1, "unpublish");
    assert.equal(fakeService.published, false);
  });

  test("alterServiceStatusSP() should throw on invalid status", async () => {
    sandbox.stub(db.Service, "findByPk").resolves({});
    await assert.rejects(
      serviceServices.alterServiceStatusSP(1, "invalid"),
      (err) => err instanceof AppError && err.httpCode === 400
    );
  });

  //
  // updateServiceRating
  //
  test("updateServiceRating() should add new rating", async () => {
    const fakeService = {
      rating: 4,
      total_reviews: 2,
      update: sinon.stub().resolves("updated"),
    };
    sandbox.stub(db.Service, "findByPk").resolves(fakeService);

    const result = await serviceServices.updateServiceRating({
      serviceId: 1,
      newRating: 5,
    });
    assert.equal(result, "updated");
  });

  test("updateServiceRating() should throw for invalid rating", async () => {
    await assert.rejects(
      serviceServices.updateServiceRating({ serviceId: 1, newRating: 6 }),
      (err) => err instanceof AppError && err.httpCode === 400
    );
  });

  test("updateServiceRating() should throw if service not found", async () => {
    sandbox.stub(db.Service, "findByPk").resolves(null);
    await assert.rejects(
      serviceServices.updateServiceRating({ serviceId: 1, newRating: 5 }),
      (err) => err instanceof AppError && err.httpCode === 404
    );
  });

  //
  // alterFavorite
  //
  test("alterFavorite() should add favorite", async () => {
    const createStub = sandbox.stub(db.Favorite, "create").resolves("added");
    const result = await serviceServices.alterFavorite(1, 2, "add");
    assert.equal(result, undefined);
    assert.ok(createStub.calledOnce);
  });

  test("alterFavorite() should remove favorite", async () => {
    const destroyStub = sandbox
      .stub(db.Favorite, "destroy")
      .resolves("removed");
    const result = await serviceServices.alterFavorite(1, 2, "remove");
    assert.equal(result, undefined);
    assert.ok(destroyStub.calledOnce);
  });

  test("alterFavorite() should throw on invalid status", async () => {
    await assert.rejects(
      serviceServices.alterFavorite(1, 2, "invalid"),
      (err) => err instanceof AppError && err.httpCode === 500
    );
  });
});
