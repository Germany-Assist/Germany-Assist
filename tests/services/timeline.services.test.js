import { test, beforeEach, afterEach, describe } from "node:test";
import assert from "node:assert/strict";
import sinon from "sinon";

import timelineServices from "../../src/modules/timeline/timeline.service.js";
import db from "../../src/database/index.js";
import { AppError } from "../../src/utils/error.class.js";

let sandbox;

beforeEach(() => {
  sandbox = sinon.createSandbox();
});

afterEach(() => {
  sandbox.restore();
});
describe("testing Timeline services", () => {
  //
  // createTimeline
  //
  test("createTimeline() should create a new timeline successfully", async () => {
    const fakeTimeline = { id: 1, label: "newTimeline" };
    const stub = sandbox.stub(db.Timeline, "create").resolves(fakeTimeline);

    const t = {};
    const result = await timelineServices.createTimeline(1, "newTimeline", t);

    assert.deepEqual(result, fakeTimeline);
    assert.ok(
      stub.calledOnceWithExactly(
        { serviceId: 1, label: "newTimeline" },
        { transaction: t }
      )
    );
  });

  //
  // activeTimeline
  //
  test("activeTimeline() should return active timeline", async () => {
    const fakeTimeline = { id: 1, serviceId: 1 };
    const stub = sandbox.stub(db.Timeline, "findOne").resolves(fakeTimeline);

    const t = {};
    const result = await timelineServices.activeTimeline(1, t);

    assert.deepEqual(result, fakeTimeline);
    assert.ok(stub.calledOnce);
    assert.deepEqual(stub.firstCall.args[0].where, {
      serviceId: 1,
      isArchived: false,
    });
  });

  test("activeTimeline() should return null if none found", async () => {
    sandbox.stub(db.Timeline, "findOne").resolves(null);

    const t = {};
    const result = await timelineServices.activeTimeline(1, t);

    assert.equal(result, null);
  });

  //
  // archiveTimeline
  //
  test("archiveTimeline() should update timeline to archived", async () => {
    const fakeResult = [1]; // Sequelize update returns [affectedCount]
    const stub = sandbox.stub(db.Timeline, "update").resolves(fakeResult);

    const t = {};
    const result = await timelineServices.archiveTimeline(5, t);

    assert.deepEqual(result, fakeResult);
    assert.ok(
      stub.calledOnceWithExactly(
        { isArchived: true },
        { where: { id: 5 }, transaction: t }
      )
    );
  });

  //
  // getTimelineFull
  //
  test("getTimelineFull() should return full timeline if found", async () => {
    const fakeTimeline = {
      toJSON: () => ({ id: 1, posts: [] }),
    };
    const stub = sandbox.stub(db.Timeline, "findOne").resolves(fakeTimeline);

    const result = await timelineServices.getTimelineFull(2, 1);

    assert.deepEqual(result, { id: 1, posts: [] });
    assert.ok(stub.calledOnce);
  });

  test("getTimelineFull() should throw if timeline not found", async () => {
    sandbox.stub(db.Timeline, "findOne").resolves(null);

    await assert.rejects(
      timelineServices.getTimelineFull(1, 99),
      (err) =>
        err instanceof AppError &&
        err.httpCode === 404 &&
        err.message.includes("failed to find the timeline")
    );
  });
});
