import sinon from "sinon";
import db from "../../database/dbIndex.js";
import {
  getBusinessById,
  updateBusinessRating,
} from "../../services/business.services.js";
import { AppError } from "../../utils/error.class.js";
import { afterEach, describe, it } from "node:test";
import assert from "node:assert";

describe("Business Service Unit Tests", () => {
  afterEach(() => sinon.restore());

  it("getBusinessById - should return business and increment views", async () => {
    const fakeProfile = { id: 1, increment: sinon.stub(), save: sinon.stub() };
    sinon.stub(db.Business, "findByPk").resolves(fakeProfile);
    const result = await getBusinessById(1);
    sinon.assert.calledOnce(fakeProfile.increment);
    sinon.assert.calledOnce(fakeProfile.save);
    assert.strictEqual(result, fakeProfile);
  });

  it("getBusinessById - should throw AppError if not found", async () => {
    sinon.stub(db.Business, "findByPk").resolves(null);
    await assert.rejects(async () => {
      await getBusinessById(999);
    }, AppError);
  });

  it("updateBusinessRating - should calculate new rating correctly", async () => {
    const fakeProfile = {
      id: 1,
      total_reviews: 2,
      rating: 4,
      update: sinon.stub().resolves("updated"),
    };
    sinon.stub(db.Business, "findByPk").resolves(fakeProfile);
    const result = await updateBusinessRating(1, 5);
    assert.strictEqual(fakeProfile.update.calledOnce, true);
    assert.strictEqual(result, "updated");
  });

  it("updateBusinessRating - invalid rating should throw", async () => {
    await assert.rejects(async () => {
      await updateBusinessRating(1, 6);
    }, AppError);
  });
});
