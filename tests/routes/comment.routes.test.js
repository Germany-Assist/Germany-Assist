import { describe, it, beforeEach, after } from "node:test";
import { app } from "../../src/app.js";
import request from "supertest";
import { errorLogger } from "../../src/utils/loggers.js";
import { initDatabase } from "../../src/database/migrateAndSeed.js";
import assert from "node:assert";
import { userWithTokenFactory } from "../factories/user.factory.js";
import { fullPostFactory } from "../factories/service.factory.js";
import hashIdUtil from "../../src/utils/hashId.util.js";
import { orderFactory } from "../factories/order.factory.js";
import db from "../../src/database/index.js";

const retrieveComment = async (filters) => {
  try {
    return await db.Comment.findOne({
      where: filters,
    });
  } catch (error) {
    console.log(error);
  }
};
beforeEach(async () => {
  try {
    await initDatabase(false);
  } catch (error) {
    errorLogger(error);
  }
});
after(async () => {
  try {
    await app?.close();
  } catch (error) {
    errorLogger(error);
  }
});
describe("api/post/comment - post - testing comment routes", () => {
  it("should create comment successfully and create a reply", async () => {
    const { post, service, timeline } = await fullPostFactory();
    const client = await userWithTokenFactory();
    const order = await orderFactory({
      user_id: client.user.id,
      timeline_id: timeline.id,
      service_id: service.id,
    });
    const commentExample = {
      body: "great product",
      postId: hashIdUtil.hashIdEncode(post.id),
    };
    const res = await request(app)
      .post("/api/post/comment/")
      .set("Authorization", `Bearer ${client.accessToken}`)
      .send(commentExample);
    assert.ok(res.body);
    assert.equal(res.status, 201);
    const comment = await retrieveComment({
      user_id: client.user.id,
      post_id: post.id,
    });
    assert.ok(comment);
    assert.equal(comment.body, commentExample.body);
    const replyExample = {
      body: "i disagree",
      postId: hashIdUtil.hashIdEncode(post.id),
      commentId: hashIdUtil.hashIdEncode(comment.id),
    };
    const replyRes = await request(app)
      .post("/api/post/comment/")
      .set("Authorization", `Bearer ${client.accessToken}`)
      .send(replyExample);
    assert.ok(replyRes.body);
    assert.equal(replyRes.status, 201);
    const reply = await retrieveComment({
      user_id: client.user.id,
      post_id: post.id,
      parent_id: comment.id,
    });
    assert.ok(reply);
    assert.equal(reply.body, replyExample.body);
  });
  it("should fail for not buying the timeline", async () => {
    const { post, service, timeline } = await fullPostFactory();
    const client = await userWithTokenFactory();
    const commentExample = {
      body: "great product",
      postId: hashIdUtil.hashIdEncode(post.id),
    };
    const res = await request(app)
      .post("/api/post/comment/")
      .set("Authorization", `Bearer ${client.accessToken}`)
      .send(commentExample);
    assert.deepEqual(res.body, {
      success: false,
      message: "permission denied",
    });
    assert.equal(res.status, 403);
  });
  it("should fail for invalid comment", async () => {
    const { post, service, timeline } = await fullPostFactory();
    const client = await userWithTokenFactory();
    const commentExample = {
      body: "",
      postId: "",
      commentId: "",
    };
    const res = await request(app)
      .post("/api/post/comment/")
      .set("Authorization", `Bearer ${client.accessToken}`)
      .send(commentExample);
    assert.deepEqual(res.body.message.errors, [
      {
        type: "field",
        value: "",
        msg: "Comment body cannot exceed 500 characters or be less that 2",
        path: "body",
        location: "body",
      },
      {
        type: "field",
        value: "",
        msg: "ID must be a valid id",
        path: "postId",
        location: "body",
      },
      {
        type: "field",
        value: "",
        msg: "invalid id",
        path: "postId",
        location: "body",
      },
      {
        type: "field",
        value: "",
        msg: "invalid id",
        path: "commentId",
        location: "body",
      },
    ]);
    assert.equal(res.status, 422);
  });
});
