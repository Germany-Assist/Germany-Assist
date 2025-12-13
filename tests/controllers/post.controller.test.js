import { describe, it, beforeEach, afterEach } from "node:test";
import sinon from "sinon";
import assert from "node:assert";
import postController from "../../src/modules/post/post.controller.js";
import postServices from "../../src/modules/post/post.service.js";
import timelineServices from "../../src/modules/timeline/timeline.service.js";
import authUtil from "../../src/utils/authorize.util.js";
import { AppError } from "../../src/utils/error.class.js";
import hashIdUtil from "../../src/utils/hashId.util.js";
import { sequelize } from "../../src/configs/database.js";

describe("Post Controller - createNewPost", () => {
  let sandbox;
  let req, res, next;
  let fakeTransaction;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    // --- Mocks & setup
    req = {
      body: {
        serviceId: "encoded-service-id",
        description: "Testing post creation",
        attachments: ["img1.png"],
      },
      auth: {
        id: 42,
        related_id: 111,
        role: "service_provider_rep",
      },
    };

    res = {
      send: sandbox.stub().returnsThis(),
      status: sandbox.stub().returnsThis(),
      json: sandbox.stub().returnsThis(),
    };

    next = sandbox.stub();

    fakeTransaction = {
      commit: sandbox.stub(),
      rollback: sandbox.stub(),
    };

    // --- Stubs
    sandbox.stub(sequelize, "transaction").resolves(fakeTransaction);
    sandbox.stub(authUtil, "checkRoleAndPermission").resolves(true);
    sandbox.stub(hashIdUtil, "hashIdDecode").returns(123);
    sandbox
      .stub(timelineServices, "activeTimeline")
      .resolves({ id: 55, Service: { owner: 111 } });
    sandbox
      .stub(postServices, "createNewPost")
      .resolves({ id: 1, description: "Testing post creation" });
  });

  afterEach(() => sandbox.restore());

  // ✅ Successful flow
  it("should create a new post successfully", async () => {
    await postController.createNewPost(req, res, next);

    sandbox.assert.calledOnce(authUtil.checkRoleAndPermission);
    sandbox.assert.calledOnce(hashIdUtil.hashIdDecode);
    sandbox.assert.calledOnce(timelineServices.activeTimeline);
    sandbox.assert.calledOnce(postServices.createNewPost);

    // Should pass correct post data
    sandbox.assert.calledWith(
      postServices.createNewPost,
      sinon.match({
        description: "Testing post creation",
        attachments: ["img1.png"],
        timeline_id: 55,
        user_id: 42,
      }),
      fakeTransaction
    );

    sandbox.assert.calledOnce(fakeTransaction.commit);
    sandbox.assert.notCalled(fakeTransaction.rollback);
    sandbox.assert.calledWith(res.status, 201);
    sandbox.assert.calledWith(res.send, {
      success: true,
      message: "Created Post Successfully",
    });
    sandbox.assert.notCalled(next);
  });

  // ❌ No timeline found
  it("should call next with AppError(404) if timeline not found", async () => {
    timelineServices.activeTimeline.resolves(null);

    await postController.createNewPost(req, res, next);

    sandbox.assert.calledOnce(fakeTransaction.rollback);
    sandbox.assert.calledOnce(next);

    const err = next.firstCall.args[0];
    assert(err instanceof AppError);
    assert.strictEqual(err.httpCode, 404);
    assert.strictEqual(err.message, "failed to find timeline");
  });

  // ❌ Invalid ownership
  it("should call next with AppError(403) if ownership is invalid", async () => {
    timelineServices.activeTimeline.resolves({
      id: 55,
      Service: { owner: 999 },
    });

    await postController.createNewPost(req, res, next);

    sandbox.assert.calledOnce(fakeTransaction.rollback);
    sandbox.assert.calledOnce(next);

    const err = next.firstCall.args[0];
    assert(err instanceof AppError);
    assert.strictEqual(err.httpCode, 403);
    assert.strictEqual(err.message, "invalid ownership");
  });

  // ❌ postServices.createNewPost throws
  it("should rollback and call next if post creation fails", async () => {
    postServices.createNewPost.rejects(new AppError(500, "DB error", true));

    await postController.createNewPost(req, res, next);

    sandbox.assert.calledOnce(fakeTransaction.rollback);
    sandbox.assert.calledOnce(next);

    const err = next.firstCall.args[0];
    assert(err instanceof AppError);
  });

  // ❌ authUtil.checkRoleAndPermission throws
  it("should rollback and call next if permission check fails", async () => {
    authUtil.checkRoleAndPermission.rejects(
      new AppError(403, "forbidden", true)
    );

    await postController.createNewPost(req, res, next);

    sandbox.assert.calledOnce(fakeTransaction.rollback);
    sandbox.assert.calledOnce(next);

    const err = next.firstCall.args[0];
    assert(err instanceof AppError);
    assert.strictEqual(err.httpCode, 403);
  });
});
