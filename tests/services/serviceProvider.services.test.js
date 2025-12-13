import { test, beforeEach, afterEach, describe } from "node:test";
import assert from "node:assert/strict";
import sinon from "sinon";

import serviceProviderService from "../../src/modules/serviceProvider/serviceProvider.services.js";
import db from "../../src/database/index.js";
import { AppError } from "../../src/utils/error.class.js";

let sandbox;

beforeEach(() => {
  sandbox = sinon.createSandbox();
});

afterEach(() => {
  sandbox.restore();
});
describe("testing Service Provider Services", () => {
  //
  // createServiceProvider
  //
  test("createServiceProvider() should create a service provider successfully", async () => {
    const fakeResult = { id: 1, name: "Test" };
    const stub = sandbox
      .stub(db.ServiceProvider, "create")
      .resolves(fakeResult);

    const profileData = {
      name: "Test",
      about: "About",
      email: "test@example.com",
      description: "Description",
      phoneNumber: "123456",
      image: "img.png",
    };

    const t = {};
    const result = await serviceProviderService.createServiceProvider(
      profileData,
      t
    );

    assert.deepEqual(result, fakeResult);
    assert.ok(
      stub.calledOnceWithExactly(sinon.match(profileData), { transaction: t })
    );
  });

  //
  // getAllServiceProvider
  //
  test("getAllServiceProvider() should return all service providers", async () => {
    const fakeData = [{ id: 1 }, { id: 2 }];
    const stub = sandbox.stub(db.ServiceProvider, "findAll").resolves(fakeData);

    const result = await serviceProviderService.getAllServiceProvider();

    assert.deepEqual(result, fakeData);
    assert.ok(stub.calledOnce);
  });

  //
  // getServiceProviderById
  //
  test("getServiceProviderById() should return service provider and increment views", async () => {
    const fakeProfile = {
      increment: sinon.stub(),
      save: sinon.stub().resolves(),
      toJSON: () => ({ id: 1, name: "Provider" }),
    };
    sandbox.stub(db.ServiceProvider, "findByPk").resolves(fakeProfile);

    const result = await serviceProviderService.getServiceProviderById(1);

    assert.deepEqual(result, { id: 1, name: "Provider" });
    assert.ok(fakeProfile.increment.calledOnceWith("views"));
    assert.ok(fakeProfile.save.calledOnce);
  });

  test("getServiceProviderById() should throw if not found", async () => {
    sandbox.stub(db.ServiceProvider, "findByPk").resolves(null);

    await assert.rejects(
      serviceProviderService.getServiceProviderById(99),
      (err) => err instanceof AppError && err.httpCode === 404
    );
  });

  //
  // updateServiceProvider
  //
  test("updateServiceProvider() should update profile successfully", async () => {
    const fakeProfile = { id: 1, name: "Updated" };
    sandbox.stub(db.ServiceProvider, "update").resolves([1, [fakeProfile]]);

    const result = await serviceProviderService.updateServiceProvider(1, {
      name: "Updated",
    });

    assert.deepEqual(result, fakeProfile);
  });

  test("updateServiceProvider() should throw if no profile updated", async () => {
    sandbox.stub(db.ServiceProvider, "update").resolves([0, []]);

    await assert.rejects(
      serviceProviderService.updateServiceProvider(1, {}),
      (err) => err instanceof AppError && err.httpCode === 404
    );
  });

  //
  // deleteServiceProvider
  //
  test("deleteServiceProvider() should delete a provider", async () => {
    const fakeProfile = { destroy: sinon.stub().resolves() };
    sandbox.stub(db.ServiceProvider, "findByPk").resolves(fakeProfile);

    const result = await serviceProviderService.deleteServiceProvider(1);

    assert.deepEqual(result, { id: 1, message: "Service Provider deleted" });
    assert.ok(fakeProfile.destroy.calledOnce);
  });

  test("deleteServiceProvider() should throw if not found", async () => {
    sandbox.stub(db.ServiceProvider, "findByPk").resolves(null);

    await assert.rejects(
      serviceProviderService.deleteServiceProvider(1),
      (err) => err instanceof AppError && err.httpCode === 404
    );
  });

  //
  // restoreServiceProvider
  //
  test("restoreServiceProvider() should restore deleted provider", async () => {
    const fakeProfile = { deletedAt: true, restore: sinon.stub().resolves() };
    sandbox.stub(db.ServiceProvider, "findOne").resolves(fakeProfile);

    const result = await serviceProviderService.restoreServiceProvider(1);

    assert.deepEqual(result, fakeProfile);
    assert.ok(fakeProfile.restore.calledOnce);
  });

  test("restoreServiceProvider() should throw if not deleted", async () => {
    const fakeProfile = { deletedAt: null };
    sandbox.stub(db.ServiceProvider, "findOne").resolves(fakeProfile);

    await assert.rejects(
      serviceProviderService.restoreServiceProvider(1),
      (err) => err instanceof AppError && err.httpCode === 400
    );
  });

  test("restoreServiceProvider() should throw if not found", async () => {
    sandbox.stub(db.ServiceProvider, "findOne").resolves(null);

    await assert.rejects(
      serviceProviderService.restoreServiceProvider(1),
      (err) => err instanceof AppError && err.httpCode === 404
    );
  });

  //
  // updateServiceProviderRating
  //
  test("updateServiceProviderRating() should update rating correctly", async () => {
    const fakeProfile = {
      totalReviews: 2,
      rating: 4,
      update: sinon.stub().resolves("updated"),
    };
    sandbox.stub(db.ServiceProvider, "findByPk").resolves(fakeProfile);

    const result = await serviceProviderService.updateServiceProviderRating(
      1,
      5
    );

    assert.equal(result, "updated");
    assert.ok(fakeProfile.update.calledOnce);
  });

  test("updateServiceProviderRating() should throw if rating invalid", async () => {
    await assert.rejects(
      serviceProviderService.updateServiceProviderRating(1, 10),
      (err) => err instanceof AppError && err.httpCode === 400
    );
  });

  test("updateServiceProviderRating() should throw if provider not found", async () => {
    sandbox.stub(db.ServiceProvider, "findByPk").resolves(null);

    await assert.rejects(
      serviceProviderService.updateServiceProviderRating(1, 4),
      (err) => err instanceof AppError && err.httpCode === 404
    );
  });
});
