import test, { describe } from "node:test";
import assert from "node:assert/strict";
import sinon from "sinon";

import { sequelize } from "../../database/connection.js";
import postController from "../../controllers/post.controller.js";
import postServices from "../../services/post.service.js";
import timelineServices from "../../services/timeline.service.js";
import hashIdUtil from "../../utils/hashId.util.js";
import { AppError } from "../../utils/error.class.js";
import authUtil from "../../utils/authorize.util.js";

describe("Testing Post Controller", () => {
  test("postController.createNewPost → creates a new post successfully", async (t) => {
    const sandbox = sinon.createSandbox();

    // 🧩 Transaction mock
    const fakeTransaction = {
      commit: sandbox.stub().resolves(),
      rollback: sandbox.stub().resolves(),
    };
    sandbox.stub(sequelize, "transaction").resolves(fakeTransaction);

    // 🧩 Decode serviceId
    sandbox.stub(hashIdUtil, "hashIdDecode").returns(10);

    // 🧩 Mock auth check
    sandbox.stub(authUtil, "checkRoleAndPermission").resolves();

    // 🧩 Active timeline mock
    const fakeTimeline = { id: 123, Service: { owner: 55 } };
    sandbox.stub(timelineServices, "activeTimeline").resolves(fakeTimeline);

    // 🧩 post creation mock
    sandbox.stub(postServices, "createNewPost").resolves({ id: 1 });

    // 🧩 Fake req / res / next
    const req = {
      auth: { id: 1, related_id: 55 },
      body: { serviceId: "abc123", description: "New post", attachments: [] },
    };
    const res = { send: sandbox.stub() };
    const next = sandbox.stub();

    // 🧪 Run the controller
    await postController.createNewPost(req, res, next);

    // ✅ Assertions
    assert.equal(authUtil.checkRoleAndPermission.calledOnce, true);
    assert.equal(timelineServices.activeTimeline.calledOnce, true);
    assert.equal(postServices.createNewPost.calledOnce, true);
    assert.equal(fakeTransaction.commit.calledOnce, true);
    assert.equal(res.send.calledWith(201), true);
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
    const res = { send: sandbox.stub() };
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
    const res = { send: sandbox.stub() };
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
    const res = { send: sandbox.stub() };
    const next = sandbox.stub();

    await postController.createNewPost(req, res, next);

    assert.equal(fakeTransaction.rollback.calledOnce, true);
    assert.equal(next.calledOnce, true);
    assert.equal(next.firstCall.args[0] instanceof Error, true);

    sandbox.restore();
  });
});
