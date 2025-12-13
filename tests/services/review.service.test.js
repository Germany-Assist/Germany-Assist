import { test, beforeEach, afterEach, describe } from "node:test";
import assert from "node:assert/strict";
import sinon from "sinon";
import reviewServices from "../../src/modules/review/review.services.js";
import db from "../../src/database/dbIndex.js";
import { AppError } from "../../src/utils/error.class.js";

let sandbox;

beforeEach(() => {
  sandbox = sinon.createSandbox();
});

afterEach(() => {
  sandbox.restore();
});

describe("testing Review Services", () => {
  //
  // canReview
  //
  test("canReview() should not throw when order exists", async () => {
    sandbox.stub(db.Order, "findOne").resolves({ id: 1 });
    await assert.doesNotReject(reviewServices.canReview(1, 2));
  });

  test("canReview() should throw AppError when user has not bought the service", async () => {
    sandbox.stub(db.Order, "findOne").resolves(null);

    await assert.rejects(
      reviewServices.canReview(1, 99),
      (err) => err instanceof AppError && err.httpCode === 403
    );
  });

  //
  // createReview
  //
  test("createReview() should create a review successfully", async () => {
    const fakeReview = { id: 1, body: "Nice service", rating: 5 };
    const data = { body: "Nice service", rating: 5, service_id: 2, user_id: 1 };
    const t = {};
    const stub = sandbox.stub(db.Review, "create").resolves(fakeReview);
    const result = await reviewServices.createReview(data, t);
    assert.deepEqual(result, fakeReview);
    assert.ok(
      stub.calledOnceWithExactly(
        { body: "Nice service", rating: 5, user_id: 1, service_id: 2 },
        { transaction: t }
      )
    );
  });

  //
  // updateReview
  //
  test("updateReview() should update review and return old rating", async () => {
    const fakeReview = {
      rating: 3,
      body: "Old",
      save: sinon.stub().resolves(),
    };
    sandbox.stub(db.Review, "findOne").resolves(fakeReview);

    const result = await reviewServices.updateReview(
      { service_id: 1, user_id: 2, body: "Updated", rating: 5 },
      {}
    );

    assert.equal(result, 3);
    assert.equal(fakeReview.body, "Updated");
    assert.equal(fakeReview.rating, 5);
    assert.ok(fakeReview.save.calledOnce);
  });

  test("updateReview() should throw AppError if no review found", async () => {
    sandbox.stub(db.Review, "findOne").resolves(null);

    await assert.rejects(
      reviewServices.updateReview({ service_id: 1, user_id: 2 }, {}),
      (err) => err instanceof AppError && err.httpCode === 404
    );
  });

  //
  // deleteReview
  //
  test("deleteReview() should destroy review when found", async () => {
    const destroyStub = sinon.stub().resolves(true);
    sandbox.stub(db.Review, "findByPk").resolves({ destroy: destroyStub });

    const result = await reviewServices.deleteReview(1);

    assert.equal(result, true);
    assert.ok(destroyStub.calledOnce);
  });

  test("deleteReview() should throw AppError if review not found", async () => {
    sandbox.stub(db.Review, "findByPk").resolves(null);

    await assert.rejects(
      reviewServices.deleteReview(99),
      (err) => err instanceof AppError && err.httpCode === 404
    );
  });

  //
  // restoreReview
  //
  test("restoreReview() should restore deleted review successfully", async () => {
    const fakeReview = {
      deletedAt: new Date(),
      restore: sinon.stub().resolves(),
    };
    sandbox.stub(db.Review, "findOne").resolves(fakeReview);

    const result = await reviewServices.restoreReview(1);

    assert.deepEqual(result, fakeReview);
    assert.ok(fakeReview.restore.calledOnce);
  });

  test("restoreReview() should throw if review not found", async () => {
    sandbox.stub(db.Review, "findOne").resolves(null);

    await assert.rejects(
      reviewServices.restoreReview(10),
      (err) => err instanceof AppError && err.httpCode === 404
    );
  });

  test("restoreReview() should throw if review is not deleted", async () => {
    sandbox.stub(db.Review, "findOne").resolves({ deletedAt: null });

    await assert.rejects(
      reviewServices.restoreReview(11),
      (err) => err instanceof AppError && err.httpCode === 400
    );
  });
});
