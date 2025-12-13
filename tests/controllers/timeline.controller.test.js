import sinon from "sinon";
import assert from "node:assert";
import { describe, it, beforeEach, afterEach } from "node:test";

import timelineController from "../../src/modules/timeline/timeline.controller.js";
import timelineServices from "../../src/modules/timeline/timeline.service.js";
import authUtil from "../../src/utils/authorize.util.js";
import { sequelize } from "../../src/database/connection.js";
import hashIdUtil from "../../src/utils/hashId.util.js";
import { AppError } from "../../src/utils/error.class.js";

describe("Timeline Controller", () => {
  let sandbox, req, res, next, fakeTransaction;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    req = {
      params: { id: "123" },
      body: { label: "New Timeline" },
      auth: { id: 1, role: "service_provider_root", related_id: "ABC" },
    };

    res = {
      send: sandbox.stub().returnsThis(),
      status: sandbox.stub().returnsThis(),
      json: sandbox.stub().returnsThis(),
    };

    next = sandbox.stub();

    fakeTransaction = { commit: sandbox.stub(), rollback: sandbox.stub() };

    // Stubs
    sandbox.stub(sequelize, "transaction").resolves(fakeTransaction);
    sandbox.stub(authUtil, "checkRoleAndPermission").resolves(true);
    sandbox.stub(hashIdUtil, "hashIdDecode").callsFake((id) => parseInt(id));
    sandbox.stub(hashIdUtil, "hashIdEncode").callsFake((id) => `hash-${id}`);
  });

  afterEach(() => sandbox.restore());

  // ----------------------
  // Test: newTimeline
  // ----------------------
  it("newTimeline should create new timeline and archive old one", async () => {
    const activeTimeline = {
      update: sandbox.stub().resolves(true),
    };
    sandbox.stub(timelineServices, "activeTimeline").resolves(activeTimeline);
    sandbox.stub(timelineServices, "createTimeline").resolves(true);

    await timelineController.newTimeline(req, res, next);

    sinon.assert.calledOnce(authUtil.checkRoleAndPermission);
    sinon.assert.calledOnce(activeTimeline.update);
    sinon.assert.calledOnce(timelineServices.createTimeline);
    sinon.assert.calledWith(res.send, 201);
    sinon.assert.calledOnce(fakeTransaction.commit);
  });

  it("newTimeline should rollback if activeTimeline not found", async () => {
    sandbox.stub(timelineServices, "activeTimeline").resolves(null);

    await timelineController.newTimeline(req, res, next);

    sinon.assert.calledOnce(fakeTransaction.rollback);
    sinon.assert.calledOnce(next);
    assert.ok(next.firstCall.args[0] instanceof AppError);
  });

  it("newTimeline should rollback on createTimeline error", async () => {
    const activeTimeline = {
      update: sandbox.stub().resolves(true),
    };
    sandbox.stub(timelineServices, "activeTimeline").resolves(activeTimeline);
    sandbox
      .stub(timelineServices, "createTimeline")
      .rejects(new AppError(500, "DB Error"));

    await timelineController.newTimeline(req, res, next);

    sinon.assert.calledOnce(fakeTransaction.rollback);
    sinon.assert.calledOnce(next);
  });

  // ----------------------
  // Test: getTimelineById
  // ----------------------
  it("getTimelineById should return timeline with posts and comments formatted", async () => {
    const timelineData = {
      id: 1,
      Posts: [
        {
          id: 10,
          description: "Post 1",
          attachments: ["file.png"],
          Comments: [
            { id: 100, body: "Comment 1", parent_id: null },
            { id: 101, body: "Reply 1", parent_id: 100 },
          ],
        },
      ],
    };

    sandbox.stub(timelineServices, "getTimelineSP").resolves(timelineData);

    await timelineController.getTimelineById(req, res, next);

    sinon.assert.calledOnce(timelineServices.getTimelineSP);
    sinon.assert.calledWith(res.send, {
      id: "hash-1",
      posts: [
        {
          id: "hash-10",
          description: "Post 1",
          attachments: ["file.png"],
          assets: [],
          comments: [
            {
              id: "hash-100",
              body: "Comment 1",
              parentId: null,
            },
            {
              id: "hash-101",
              body: "Reply 1",
              parentId: "hash-100",
            },
          ],
        },
      ],
    });
  });

  it("getTimelineById should call next if timeline not found", async () => {
    sandbox.stub(timelineServices, "getTimelineSP").resolves(null);

    await timelineController.getTimelineById(req, res, next);

    sinon.assert.calledOnce(next);
    assert(next.firstCall.args[0] instanceof AppError);
  });

  it("getTimelineById should call next on service error", async () => {
    sandbox
      .stub(timelineServices, "getTimelineFull")
      .rejects(new AppError(500, "DB Error"));

    await timelineController.getTimelineById(req, res, next);

    sinon.assert.calledOnce(next);
  });
});
