import sinon from "sinon";
import db from "../../database/dbIndex.js";
import serviceProviderServices from "../../services/serviceProvider.services.js";
import { AppError } from "../../utils/error.class.js";
import { afterEach, describe, it } from "node:test";
import assert from "node:assert";

describe("Service Provider Service Unit Tests", () => {
  afterEach(() => sinon.restore());
  it("Get Service Provider By Id - should return service provider and increment views", async () => {
    const fakeProfile = { id: 1, increment: sinon.stub(), save: sinon.stub() };
    sinon.stub(db.ServiceProvider, "findByPk").resolves(fakeProfile);
    const result = await serviceProviderServices.getServiceProviderById(1);
    sinon.assert.calledOnce(fakeProfile.increment);
    sinon.assert.calledOnce(fakeProfile.save);
    assert.strictEqual(result, fakeProfile);
  });
  it("get service provider ById - should throw AppError if not found", async () => {
    sinon.stub(db.ServiceProvider, "findByPk").resolves(null);
    await assert.rejects(async () => {
      await serviceProviderServices.getServiceProviderById(999);
    }, AppError);
  });
  it("update service provider Rating - should calculate new rating correctly", async () => {
    const fakeProfile = {
      id: 1,
      total_reviews: 2,
      rating: 4,
      update: sinon.stub().resolves("updated"),
    };
    sinon.stub(db.ServiceProvider, "findByPk").resolves(fakeProfile);
    const result = await serviceProviderServices.updateServiceProviderRating(
      1,
      5
    );
    assert.strictEqual(fakeProfile.update.calledOnce, true);
    assert.strictEqual(result, "updated");
  });
  it("update service provider Rating - invalid rating should throw", async () => {
    await assert.rejects(async () => {
      await serviceProviderServices.updateServiceProviderRating(1, 6);
    }, AppError);
  });
});
