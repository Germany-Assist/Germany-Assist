import test, { describe } from "node:test";
import assert from "node:assert/strict";
import sinon from "sinon";
import { sequelize } from "../../src/configs/database.js";
import postController from "../../src/modules/post/post.controller.js";
import postServices from "../../src/modules/post/post.service.js";
import timelineServices from "../../src/modules/timeline/timeline.service.js";
import hashIdUtil from "../../src/utils/hashId.util.js";
import { AppError } from "../../src/utils/error.class.js";
import authUtil from "../../src/utils/authorize.util.js";

describe("Testing Post Controller", () => {
  test("postController.createNewPost → creates a new post successfully", async (t) => {
    const sandbox = sinon.createSandbox();
    const fakeTransaction = {
      commit: sandbox.stub().resolves(),
      rollback: sandbox.stub().resolves(),
    };
    sandbox.stub(sequelize, "transaction").resolves(fakeTransaction);
    sandbox.stub(hashIdUtil, "hashIdDecode").returns(10);
    sandbox.stub(authUtil, "checkRoleAndPermission").resolves();
    const fakeTimeline = { id: 123, Service: { owner: 55 } };
    sandbox.stub(timelineServices, "activeTimeline").resolves(fakeTimeline);
    sandbox.stub(postServices, "createNewPost").resolves({ id: 1 });
    const req = {
      auth: { id: 1, related_id: 55 },
      body: { serviceId: "abc123", description: "New post", attachments: [] },
    };
    const res = { send: sandbox.stub(), status: sandbox.stub().returnsThis() };
    const next = sandbox.stub();

    await postController.createNewPost(req, res, next);

    // ✅ Assertions
    assert.equal(authUtil.checkRoleAndPermission.calledOnce, true);
    assert.equal(timelineServices.activeTimeline.calledOnce, true);
    assert.equal(postServices.createNewPost.calledOnce, true);
    assert.equal(fakeTransaction.commit.calledOnce, true);
    assert.equal(res.status.calledWith(201), true);
    assert.equal(
      res.send.calledWith({
        success: true,
        message: "Created Post Successfully",
      }),
      true
    );
    assert.equal(next.called, false);

    sandbox.restore();
  });

  test("postController.createNewPost → fails if timeline not found", async (t) => {
    const sandbox = sinon.createSandbox();

    const fakeTransaction = {
      commit: sandbox.stub().resolves(),
      rollback: sandbox.stub().resolves(),
    };
    sandbox.stub(sequelize, "transaction").resolves(fakeTransaction);

    sandbox.stub(hashIdUtil, "hashIdDecode").returns(10);
    sandbox.stub(authUtil, "checkRoleAndPermission").resolves();
    sandbox.stub(timelineServices, "activeTimeline").resolves(null);

    const req = { auth: { id: 1, related_id: 55 }, body: { serviceId: "abc" } };
    const res = { send: sandbox.stub(), status: sandbox.stub().returnsThis() };
    const next = sandbox.stub();

    await postController.createNewPost(req, res, next);

    // ✅ Should call rollback and next with AppError
    assert.equal(fakeTransaction.rollback.calledOnce, true);
    assert.equal(next.calledOnce, true);
    assert.equal(next.firstCall.args[0] instanceof AppError, true);

    sandbox.restore();
  });

  test("postController.createNewPost → fails on invalid ownership", async (t) => {
    const sandbox = sinon.createSandbox();

    const fakeTransaction = {
      commit: sandbox.stub().resolves(),
      rollback: sandbox.stub().resolves(),
    };
    sandbox.stub(sequelize, "transaction").resolves(fakeTransaction);

    sandbox.stub(hashIdUtil, "hashIdDecode").returns(10);
    sandbox.stub(authUtil, "checkRoleAndPermission").resolves();
    sandbox
      .stub(timelineServices, "activeTimeline")
      .resolves({ id: 1, Service: { owner: 99 } });

    const req = { auth: { id: 1, related_id: 55 }, body: { serviceId: "abc" } };
    const res = { send: sandbox.stub(), status: sandbox.stub().returnsThis() };
    const next = sandbox.stub();

    await postController.createNewPost(req, res, next);

    // ✅ Should reject and rollback
    assert.equal(fakeTransaction.rollback.calledOnce, true);
    assert.equal(next.calledOnce, true);
    assert.equal(next.firstCall.args[0] instanceof AppError, true);

    sandbox.restore();
  });

  test("postController.createNewPost → handles unexpected errors gracefully", async (t) => {
    const sandbox = sinon.createSandbox();

    const fakeTransaction = {
      commit: sandbox.stub().resolves(),
      rollback: sandbox.stub().resolves(),
    };
    sandbox.stub(sequelize, "transaction").resolves(fakeTransaction);

    sandbox.stub(hashIdUtil, "hashIdDecode").throws(new Error("hash failed"));
    const req = { auth: { id: 1 }, body: { serviceId: "abc" } };
    const res = { send: sandbox.stub(), status: sandbox.stub().returnsThis() };
    const next = sandbox.stub();

    await postController.createNewPost(req, res, next);

    assert.equal(fakeTransaction.rollback.calledOnce, true);
    assert.equal(next.calledOnce, true);
    assert.equal(next.firstCall.args[0] instanceof Error, true);

    sandbox.restore();
  });
});
