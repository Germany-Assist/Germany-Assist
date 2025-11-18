import { describe, it, beforeEach } from "node:test";
import { app } from "../../app.js";
import request from "supertest";
import { errorLogger } from "../../utils/loggers.js";
import { initDatabase } from "../../database/migrateAndSeed.js";
import assert from "node:assert";
import { fullServiceFactory } from "../factories/service.factory.js";
import hashIdUtil from "../../utils/hashId.util.js";
import db from "../../database/dbIndex.js";
beforeEach(async () => {
  try {
    await initDatabase(false);
  } catch (error) {
    errorLogger(error);
  }
});
async function retrievePost(filters) {
  try {
    return await db.Post.findOne({ where: filters });
  } catch (error) {
    console.log(error);
  }
}
describe("api/post - post - testing create new post", () => {
  it("should create new post successfully", async () => {
    const { SP, timeline, service } = await fullServiceFactory();
    const examplePost = {
      serviceId: hashIdUtil.hashIdEncode(service.id),
      description: "please send your email by the end of the day",
      attachments: [{ name: "sheet.drive.com", url: "doc.ecample.com" }],
    };
    const res = await request(app)
      .post("/api/post")
      .set("Authorization", `Bearer ${SP.accessToken}`)
      .send(examplePost);
    assert.equal(res.status, 201);
    assert.deepEqual(res.body, {
      success: true,
      message: "Created Post Successfully",
    });
    const post = await retrievePost({ timeline_id: timeline.id });
    assert.equal(post.description, examplePost.description);
  });
  it("should fail for validation errors", async () => {
    const { SP, timeline, service } = await fullServiceFactory();
    const examplePost = {
      serviceId: "",
      description: "",
      attachments: "",
    };
    const res = await request(app)
      .post("/api/post")
      .set("Authorization", `Bearer ${SP.accessToken}`)
      .send(examplePost);
    assert.deepEqual(res.body.message.errors, [
      {
        type: "field",
        value: "",
        msg: "Description cannot be empty",
        path: "description",
        location: "body",
      },
      {
        type: "field",
        value: "",
        msg: "Description must be between 5 and 255 characters",
        path: "description",
        location: "body",
      },
      {
        type: "field",
        value: "",
        msg: "service id cannot be empty",
        path: "serviceId",
        location: "body",
      },
      {
        type: "field",
        value: "",
        msg: "invalid id",
        path: "serviceId",
        location: "body",
      },
      {
        type: "field",
        value: "",
        msg: "Attachments must be an array",
        path: "attachments",
        location: "body",
      },
    ]);
  });
});
