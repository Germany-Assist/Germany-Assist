import commentServices from "../../src/modules/comment/comment.services.js";
import db from "../../src/database/index.js";
import test, { beforeEach, afterEach, describe } from "node:test";
import sinon from "sinon";
import assert from "node:assert";
import { Op } from "sequelize";
let findOneStub;
beforeEach(() => {
  findOneStub = sinon.stub(db.Post, "findOne");
});
afterEach(() => {
  sinon.restore();
});

describe("testing comment services", () => {
  test("should return a post when user can comment", async () => {
    const fakePost = { id: 10 };
    findOneStub.resolves(fakePost);
    const userId = 5;
    const postId = 10;
    const result = await commentServices.canCommentOnPost(userId, postId);
    assert.deepStrictEqual(result, fakePost);
    sinon.assert.calledOnce(findOneStub);
    const query = findOneStub.firstCall.args[0];
    assert.strictEqual(query.where.id, postId);
    assert.ok(query.include[0].model === db.Timeline);
    assert.ok(query.include[0].include[0].model === db.Order);
    const statusFilter = query.include[0].include[0].where.status[Op.or];
    assert.deepStrictEqual(statusFilter, ["paid", "fulfilled", "completed"]);
  });

  test("should return null when user cannot comment", async () => {
    findOneStub.resolves(null);
    const result = await commentServices.canCommentOnPost(5, 99);
    assert.strictEqual(result, null);
  });
});
