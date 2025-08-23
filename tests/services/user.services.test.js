import userServices from "../../services/user.services.js";
import db from "../../database/dbIndex.js";
import sinon from "sinon";
import { describe, it, beforeEach, afterEach, before, after } from "node:test";
import bcryptUtil from "../../utils/bcrypt.util.js";
import assert from "node:assert";
import { AppError } from "../../utils/error.class.js";

describe("Testing User Services", () => {
  let sandbox;
  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(bcryptUtil, "hashCompare").returns(true);
    sandbox
      .stub(db.User, "findOne")
      .resolves({ email: "test@test.com", password: "Pass@ord" });
  });
  afterEach(() => {
    sandbox.restore();
  });
  it("should Log User In", async () => {
    let email = "test@test.com";
    let password = "Pass@ord";
    await userServices.loginUser({ email, password });
    sandbox.assert.calledOnce(db.User.findOne);
  });
  it("should throw a compare error", async () => {
    let email = "test@test.com";
    let password = "Pass@ord";
    bcryptUtil.hashCompare.callsFake(() => false);
    await assert.rejects(async () => {
      await userServices.loginUser({ email, password });
    }, AppError);
    sandbox.assert.calledOnce(db.User.findOne);
  });
});
